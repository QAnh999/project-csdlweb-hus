from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/flight-tracking", tags=["Flight Tracking"])

@router.post("/add")
async def add_flight(flight: schemas.FlightCreate, db: AsyncSession = Depends(get_db)):
    new_flight = models.Flight(**flight.dict())
    db.add(new_flight)
    await db.commit()
    await db.refresh(new_flight)
    return {"status": "success", "id": new_flight.id}

@router.get("/search")
async def search_flights(origin: str, destination: str, f_date: date, ticket_class: str = "economy", db: AsyncSession = Depends(get_db)):
    # Aliasing
    from sqlalchemy.orm import aliased
    DA = aliased(models.Airport)
    AA = aliased(models.Airport)
    
    stmt = select(models.Flight)\
        .join(DA, models.Flight.dep_airport == DA.id)\
        .join(AA, models.Flight.arr_airport == AA.id)\
        .where(func.lower(DA.city) == origin.lower())\
        .where(func.lower(AA.city) == destination.lower())\
        .where(func.date(models.Flight.dep_datetime) == f_date)

    if ticket_class == 'economy': 
        stmt = stmt.where(models.Flight.available_seats_economy > 0)
    elif ticket_class == 'business': 
        stmt = stmt.where(models.Flight.available_seats_business > 0)
        
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{flight_id}")
async def get_flight(flight_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Flight).where(models.Flight.id == flight_id))
    flight = result.scalars().first()
    if not flight: raise HTTPException(404)
    return flight

@router.delete("/{flight_id}")
async def delete_flight(flight_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Flight).where(models.Flight.id == flight_id))
    flight = result.scalars().first()
    if not flight: raise HTTPException(404)
    
    await db.delete(flight)
    await db.commit()
    return {"status": "deleted"}