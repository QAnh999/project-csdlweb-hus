# routers/aircrafts.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional  # THÊM Optional
from database import get_db
from models import Aircraft
from pydantic import BaseModel

router = APIRouter(prefix="/aircrafts", tags=["Aircrafts"])

class AircraftResponse(BaseModel):
    id: int
    model: str
    manufacturer: Optional[str] = None  # SỬA: Optional[str]
    capacity_economy: int
    capacity_business: int
    capacity_first: int
    total_capacity: int
    id_airline: int
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[AircraftResponse])
def get_all_aircrafts(db: Session = Depends(get_db)):
    """
    Lấy tất cả máy bay
    """
    aircrafts = db.query(Aircraft).order_by(Aircraft.id).all()
    return aircrafts

@router.get("/{aircraft_id}", response_model=AircraftResponse)
def get_aircraft_by_id(aircraft_id: int, db: Session = Depends(get_db)):
    """
    Lấy máy bay theo ID
    """
    aircraft = db.query(Aircraft).filter(Aircraft.id == aircraft_id).first()
    
    if not aircraft:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    
    return aircraft