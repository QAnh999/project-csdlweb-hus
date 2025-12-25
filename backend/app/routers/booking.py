from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.security import get_current_user_id
from app.core.database import get_db
from app.controllers.booking import booking_controller
from app.schemas.booking import (
    BookingCreate,
    BookingBaseResponse,
    BookingHoldSeatsRequest,
    BookingSeatResponse,
    BookingPassengerRequest,
    PassengerInfo,
    BookingFinalizeRequest,
    BookingFinalizeResponse,
    BookingPaymentRequest,
    BookingPaymentResponse,
    BookingDetailResponse,
    BookingServiceRequest,
    BookingServiceResponse
)

router = APIRouter(prefix="/booking", tags=["Booking"])

@router.post("/", response_model=BookingBaseResponse)
def create_booking(req: BookingCreate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return booking_controller.create_booking(db, user_id, req)

@router.get("/seats/{flight_id}", response_model=BookingSeatResponse)
def get_available_seats(flight_id: int, seat_class: str, db: Session = Depends(get_db)):
    return booking_controller.get_available_seats(db, flight_id, seat_class)

@router.post("/{reservation_id}/hold-seats")
def hold_seats(reservation_id: int, req: BookingHoldSeatsRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return booking_controller.hold_seats(db, user_id, reservation_id, req)

@router.post("/{reservation_id}/passengers", response_model=List[PassengerInfo])
def add_passengers(reservation_id: int, req: BookingPassengerRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return booking_controller.add_passengers(db, user_id, reservation_id, req)

@router.post("/{reservation_id}/finalize", response_model=BookingFinalizeResponse)
def finalize_booking(reservation_id: int, req: BookingFinalizeRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return booking_controller.finalize_booking(db, user_id, reservation_id, req)

@router.post("/{reservation_id}/services", response_model=BookingServiceResponse)
def add_services(reservation_id: int, req: BookingServiceRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return booking_controller.add_services_to_booking(db, user_id, reservation_id, req)
    
@router.post("/{reservation_id}/payment", response_model=BookingPaymentResponse)
def create_payment(reservation_id: int, req: BookingPaymentRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return booking_controller.create_payment(db, user_id, reservation_id, req)

@router.post("/payment/{payment_id}/confirm", response_model=BookingPaymentResponse)
def confirm_payment(payment_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return booking_controller.confirm_payment(db, user_id, payment_id)

@router.get("/{reservation_id}", response_model=BookingDetailResponse)
def get_booking_detail(reservation_id: int, db: Session = Depends(get_db)):
    return booking_controller.get_booking_details(db, reservation_id)

@router.post("/{reservation_id}/cancel")
def cancel_booking(reservation_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return booking_controller.cancel_booking(db, user_id, reservation_id)
    
