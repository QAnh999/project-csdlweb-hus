# routers/airlines.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional  # THÊM Optional
from database import get_db
from models import Airline
from pydantic import BaseModel

router = APIRouter(prefix="/admin/airlines", tags=["Airlines"])

class AirlineResponse(BaseModel):
    id: int
    name: str
    code: str
    logo_url: Optional[str] = None  # SỬA: Optional[str]
    contact_email: Optional[str] = None  # SỬA: Optional[str]
    phone: Optional[str] = None  # SỬA: Optional[str]
    website: Optional[str] = None  # SỬA: Optional[str]
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[AirlineResponse])
def get_all_airlines(db: Session = Depends(get_db)):
    """
    Lấy tất cả hãng hàng không
    """
    airlines = db.query(Airline).order_by(Airline.id).all()
    return airlines

@router.get("/{airline_id}", response_model=AirlineResponse)
def get_airline_by_id(airline_id: int, db: Session = Depends(get_db)):
    """
    Lấy hãng hàng không theo ID
    """
    airline = db.query(Airline).filter(Airline.id == airline_id).first()
    
    if not airline:
        raise HTTPException(status_code=404, detail="Airline not found")
    
    return airline