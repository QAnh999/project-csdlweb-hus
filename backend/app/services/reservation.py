from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.repositories.reservation import reservation_repository
from app.repositories.reservation_detail import reservation_detail_repository
from app.repositories.flight import flight_repository
from app.repositories.passenger import passenger_repository
from app.repositories.invoice import invoice_repository
from app.services.seat import seat_service
from app.utils.calculator import calculate_total
from app.utils.validators import validate_booking_data
from app.utils.helper import generate_reservation_code, generate_invoice_number, generate_ticket_number

class ReservationService:
    HOLD_HOURS = 24

    def __init__(self):
        self.reservation_repo = reservation_repository
        self.detail_repo = reservation_detail_repository
        self.flight_repo = flight_repository
        self.passenger_repo = passenger_repository
        self.seat_serv = seat_service
        self.invoice_repo = invoice_repository

    def _get_or_create_passenger(self, db: Session, user_id: int, data: dict):
        passenger = self.passenger_repo.get_by_user(db, user_id)
        if passenger:
            return passenger
        return self.passenger_repo.create(db, {"user_id": user_id, **data})

    def _process_flight(self, db: Session, flight_id: int, passenger_data: list, selected_seats: list[int], seat_class: str):
        flight = self.flight_repo.get(db, flight_id)
        if not flight:
            raise ValueError(f"Chuyến bay {flight_id} không tồn tại")

        if selected_seats:
            if len(selected_seats) != len(passenger_data):
                raise ValueError("Số lượng ghế phải bằng số lượng hành khách")
            self.seat_serv.hold_seats(db, flight.id, selected_seats)
            seats = self.seat_serv.seat_repo.get_by_ids(db, selected_seats)
        else:
            seats = [None] * len(passenger_data)

        pricing = calculate_total(flight, seat_class, passenger_data, seats)
        return flight, seats, pricing

    def create_reservation(self, db: Session, user_id: int, data: dict):
        validate_booking_data(data)

        main_flight, main_seats, main_pricing = self._process_flight(
            db, data["main_flight_id"], data["passengers"], data.get("selected_seats", []), data["seat_class"]
        )

        return_flight_id = data.get("return_flight_id")
        if return_flight_id:
            return_flight, return_seats, return_pricing = self._process_flight(
                db, return_flight_id, data["passengers"], data.get("return_selected_seats", []), data["seat_class"]
            )
        else:
            return_flight = None
            return_seats = []
            return_pricing = None

        expires_at = datetime.utcnow() + timedelta(hours=self.HOLD_HOURS)

        reservation = self.reservation_repo.create(db, {
            "reservation_code": generate_reservation_code(),
            "user_id": user_id,
            "main_flight_id": main_flight.id,
            "return_flight_id": return_flight.id if return_flight else None,
            "total_passengers": len(data["passengers"]),
            "total_amount": main_pricing["total_amount"] + (return_pricing["total_amount"] if return_pricing else 0),
            "tax_amount": main_pricing["tax_amount"] + (return_pricing["tax_amount"] if return_pricing else 0),
            "status": "pending",
            "expires_at": expires_at
        })

        details = []
        for i, p in enumerate(data["passengers"]):
            passenger = self._get_or_create_passenger(db, user_id, p)
            seat_id = main_seats[i].id if main_seats[i] else None
            detail = self.detail_repo.create(db, {
                "reservation_id": reservation.id,
                "passenger_id": passenger.id,
                "flight_id": main_flight.id,
                "seat_id": seat_id,
                "base_fare": main_pricing["base_fare_per_passenger"][i],
                "seat_surcharge": main_pricing["seat_surcharge_per_passenger"][i],
                "luggage_surcharge": main_pricing["luggage_surcharge_per_passenger"][i],
                "tax_fare": main_pricing["tax_per_passenger"][i],
                "total_fare": main_pricing["total_per_passenger"][i],
                "checkin_status": "not_checked_in"
            })
            details.append(detail)

        if return_flight:
            for i, p in enumerate(data["passengers"]):
                passenger = self._get_or_create_passenger(db, user_id, p)
                seat_id = return_seats[i].id if return_seats[i] else None
                detail = self.detail_repo.create(db, {
                    "reservation_id": reservation.id,
                    "passenger_id": passenger.id,
                    "flight_id": return_flight.id,
                    "seat_id": seat_id,
                    "base_fare": return_pricing["base_fare_per_passenger"][i],
                    "seat_surcharge": return_pricing["seat_surcharge_per_passenger"][i],
                    "luggage_surcharge": return_pricing["luggage_surcharge_per_passenger"][i],
                    "tax_fare": return_pricing["tax_per_passenger"][i],
                    "total_fare": return_pricing["total_per_passenger"][i],
                    "checkin_status": "not_checked_in"
                })
                details.append(detail)
        
        details = self.detail_repo.get_by_reservation_with_seat(db, reservation.id)

        invoice = self.invoice_repo.create(db, {
            "invoice_number": generate_invoice_number(),
            "reservation_id": reservation.id,
            "user_id": user_id,
            "total_amount": reservation.total_amount,
            "tax_amount": reservation.tax_amount,
            "due_date": expires_at,
            "status": "unpaid"
        })

        booked_seats = []
        for seat in main_seats + return_seats:
            if seat:
                booked_seats.append({
                    "seat_id": seat.id,
                    "seat_number": seat.seat_number,
                    "seat_class": seat.seat_class,
                    "status": "held"
                })

        # reservation_data = {
        #     "id": reservation.id,
        #     "reservation_code": reservation.reservation_code,
        #     "user_id": user_id,
        #     "main_flight_id": main_flight.id,
        #     "return_flight_id": return_flight.id if return_flight else None,
        #     "total_passengers": len(data["passengers"]),
        #     "total_amount": reservation.total_amount,
        #     "tax_amount": reservation.tax_amount,
        #     "status": reservation.status,
        #     "expires_at": reservation.expires_at,
        #     "booked_seats": booked_seats,
        #     "invoice": {
        #         "invoice_number": invoice.invoice_number,
        #         "total_amount": invoice.total_amount,
        #         "tax_amount": invoice.tax_amount,
        #         "status": invoice.status,
        #         "issue_date": invoice.issue_date,
        #         "due_date": invoice.due_date
        #     }
        # }

        return reservation, details, invoice

    def confirm_reservation(self, db: Session, reservation_id: int):
        reservation = self.reservation_repo.get(db, reservation_id)
        if not reservation:
            raise ValueError("Mã đặt chỗ không tồn tại")
        self.reservation_repo.update(db, reservation, {"status": "confirmed"})

    def cancel_reservation(self, db: Session, reservation_id: int):
        reservation = self.reservation_repo.get(db, reservation_id)
        if not reservation:
            raise ValueError("Mã đặt chỗ không tồn tại")
        self.reservation_repo.update(db, reservation, {"status": "cancelled"})
        self.seat_serv.release_by_reservation(db, reservation_id)

reservation_service = ReservationService()
