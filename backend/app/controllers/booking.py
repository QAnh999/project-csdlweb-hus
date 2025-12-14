from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.services.booking import booking_service
from app.schemas.booking import BookingRequest, BookingResponse, PaymentResponse, PaymentInfo, BookedSeat, InvoiceInfo

class BookingController:
    def __init__(self):
        self.booking_serv = booking_service

    def book(self, db: Session, booking_data: BookingRequest) -> BookingResponse:
        try:
            result = self.booking_serv.book(db, booking_data.user_id, booking_data.model_dump())
            reservation = result["reservation"]
            details = result["details"]
            invoice = result["invoice"]

            return BookingResponse.model_validate({
                "id": reservation.id,
                "reservation_code": reservation.reservation_code,
                "user_id": reservation.user_id,
                "main_flight_id": reservation.main_flight_id,
                "return_flight_id": reservation.return_flight_id,
                "total_passengers": reservation.total_passengers,
                "total_amount": reservation.total_amount,
                "paid_amount": reservation.paid_amount,
                "discount_amount": reservation.discount_amount,
                "tax_amount": reservation.tax_amount,
                "status": reservation.status,
                "expires_at": reservation.expires_at,
                "created_at": reservation.created_at,
                "updated_at": reservation.updated_at,
                "booked_seats": [BookedSeat.model_validate({
                    "seat_id": d.seat_id,
                    "seat_number": d.seat.seat_number if d.seat else None,
                    "seat_class": d.seat.seat_class if d.seat else None,
                    "status": "held"
                }) for d in details],
                "payment": None,
                "invoice": InvoiceInfo.model_validate(invoice)
            })
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    def pay(self, db: Session, reservation_id: int, payment_method: str, seat_ids: list[int]) -> PaymentResponse:
        try:
            result = self.booking_serv.pay(db, reservation_id, payment_method, seat_ids)
            reservation = self.booking_serv.reservation_serv.reservation_repo.get(db, reservation_id)

            return PaymentResponse.model_validate({
                "id": result["payment"].id,
                "reservation_id": reservation.id,
                "payment": PaymentInfo.model_validate(result["payment"]),
                "booked_seats": [BookedSeat.model_validate({
                    "seat_id": d.seat_id,
                    "seat_number": d.seat.seat_number if d.seat else None,
                    "seat_class": d.seat.seat_class if d.seat else None,
                    "status": "confirmed"
                }) for d in reservation.reservation_details],
                "invoice": InvoiceInfo.model_validate(reservation.invoices[0]) if reservation.invoices else None
            })
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))


booking_controller = BookingController()
