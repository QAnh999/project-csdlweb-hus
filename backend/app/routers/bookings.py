from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Reservation, User, Flight
import schemas
from typing import List

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.get("/", response_model=List[schemas.BookingResponse])
def get_bookings(db: Session = Depends(get_db)):
    bookings = db.query(
        Reservation.reservation_code,
        User.first_name,
        User.last_name,
        User.email,
        Reservation.created_at,
        Reservation.status
    ).join(User, Reservation.user_id == User.id
    ).order_by(Reservation.created_at.desc()
    ).limit(10).all()
    
    return [
        {
            "reservation_code": booking.reservation_code,
            "user_name": f"{booking.first_name} {booking.last_name}",
            "email": booking.email,
            "booking_time": booking.created_at,
            "status": booking.status
        }
        for booking in bookings
    ]