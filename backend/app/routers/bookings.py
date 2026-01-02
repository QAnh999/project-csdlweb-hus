from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models

router = APIRouter(prefix="/booking", tags=["Booking"])

@router.get("/")
def list_bookings(db: Session = Depends(get_db)):
    # 10 cái mới nhất
    bookings = db.query(models.Reservation)\
        .order_by(models.Reservation.created_at.desc())\
        .limit(10).all()
        
    res = []
    for b in bookings:
        name = f"{b.user.last_name} {b.user.first_name}" if b.user else b.passenger_name
        email = b.user.email if b.user else b.contact_email
        res.append({
            "booking_code": b.reservation_code,
            "name": name,
            "email": email,
            "created_at": b.created_at,
            "status": b.status
        })
    return res