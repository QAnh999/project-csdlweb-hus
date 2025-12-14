from sqlalchemy.orm import Session
from app.services.reservation import reservation_service
from app.services.payment import payment_service
from app.services.seat import seat_service


class BookingService:
    def __init__(self):
        self.reservation_serv = reservation_service
        self.payment_serv = payment_service
        self.seat_serv = seat_service

    def book(self, db: Session, user_id: int, data: dict):
        reservation, details, invoice = self.reservation_serv.create_reservation(db, user_id, data)
        return {
            "reservation": reservation,
            "details": details,
            "invoice": invoice
        }
    
    def pay(self, db: Session, reservation_id: int, method: str, seat_ids: list[int]):
        payment = self.payment_serv.create_payment(db, reservation_id, method)

        self.reservation_serv.confirm_reservation(db, reservation_id)

        if seat_ids:
            reservation = self.reservation_serv.reservation_repo.get(db, reservation_id)
            self.seat_serv.confirm_seats(db, reservation.main_flight_id, reservation_id, seat_ids)

        return {
            "payment": payment,
            "reservation_id": reservation_id,
            "status": "confirmed"
        }

booking_service = BookingService()