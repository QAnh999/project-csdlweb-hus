import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.controllers.booking import booking_controller
from app.schemas.booking import BookingRequest, BookingResponse, PaymentRequest, PaymentResponse

router = APIRouter(prefix="/booking", tags=["Booking"])

# Cấu hình logging cơ bản
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("booking_router")

@router.post("/book", response_model=BookingResponse)
def book(booking_request: BookingRequest, db: Session = Depends(get_db)):
    logger.info("Received booking request: %s", booking_request.model_dump())
    try:
        result = booking_controller.book(db, booking_request)
        logger.info("Booking result: %s", result)
        return result
    except Exception as e:
        logger.error("Error in booking: %s", str(e), exc_info=True)
        raise

@router.post("/pay/{reservation_id}", response_model=PaymentResponse)
def pay(reservation_id: int, payment_request: PaymentRequest, db: Session = Depends(get_db)):
    seat_ids = payment_request.seat_ids or []
    logger.info(
        "Received payment request for reservation_id=%s, payment_method=%s, seat_ids=%s",
        reservation_id,
        payment_request.payment_method,
        seat_ids
    )
    try:
        result = booking_controller.pay(
            db,
            reservation_id=reservation_id,
            payment_method=payment_request.payment_method,
            seat_ids=seat_ids
        )
        logger.info("Payment result: %s", result)
        return result
    except Exception as e:
        logger.error("Error in payment: %s", str(e), exc_info=True)
        raise
