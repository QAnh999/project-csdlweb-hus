from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func
from datetime import date
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/flight-tracking", tags=["Flight Tracking"])

@router.post("/add")
def add_flight(flight: schemas.FlightCreate, db: Session = Depends(get_db)):
    if flight.dep_datetime.tzinfo: flight.dep_datetime = flight.dep_datetime.replace(tzinfo=None)
    if flight.arr_datetime.tzinfo: flight.arr_datetime = flight.arr_datetime.replace(tzinfo=None)
    
    new_flight = models.Flight(**flight.dict())
    db.add(new_flight)
    db.commit()
    return {"status": "success", "id": new_flight.id}

@router.get("/search")
def search(origin: str, destination: str, f_date: date, ticket_class: str = "economy", db: Session = Depends(get_db)):
    # Chỉ hiện flight có status != 'deleted'
    A1 = aliased(models.Airport)
    A2 = aliased(models.Airport)
    
    query = db.query(models.Flight)\
        .join(A1, models.Flight.dep_airport == A1.id)\
        .join(A2, models.Flight.arr_airport == A2.id)\
        .filter(func.lower(A1.city) == origin.lower())\
        .filter(func.lower(A2.city) == destination.lower())\
        .filter(func.date(models.Flight.dep_datetime) == f_date)\
        .filter(models.Flight.status != 'deleted') 

    if ticket_class == "business":
        query = query.filter(models.Flight.available_seats_business > 0)
    else:
        query = query.filter(models.Flight.available_seats_economy > 0)
        
    return query.all()

@router.get("/{id}")
def detail(id: int, db: Session = Depends(get_db)):
    f = db.query(models.Flight).filter(models.Flight.id == id).first()
    if not f: raise HTTPException(404, "Not found")
    return f

@router.delete("/{id}")
def delete_flight(id: int, db: Session = Depends(get_db)):
    f = db.query(models.Flight).filter(models.Flight.id == id).first()
    if not f: raise HTTPException(404)
    
    # Soft delete: chuyển status thành deleted
    f.status = 'deleted'
    db.commit()
    return {"status": "success", "message": "Flight status changed to deleted"}