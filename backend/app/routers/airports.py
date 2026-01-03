# routers/airports.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional  # THÊM Optional
from database import get_db
from models import Airport
from pydantic import BaseModel

router = APIRouter(prefix="/airports", tags=["Airports"])

class AirportResponse(BaseModel):
    id: int
    name: str
    city: str
    country: str
    iata: Optional[str] = None  # SỬA: Optional[str] thay vì str | None
    icao: Optional[str] = None  # SỬA: Optional[str] thay vì str | None
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[AirportResponse])
def get_all_airports(db: Session = Depends(get_db)):
    """
    Lấy tất cả sân bay
    """
    airports = db.query(Airport).order_by(Airport.id).all()
    return airports

@router.get("/{airport_id}", response_model=AirportResponse)
def get_airport_by_id(airport_id: int, db: Session = Depends(get_db)):
    """
    Lấy sân bay theo ID
    """
    airport = db.query(Airport).filter(Airport.id == airport_id).first()
    
    if not airport:
        raise HTTPException(status_code=404, detail="Airport not found")
    
    return airport