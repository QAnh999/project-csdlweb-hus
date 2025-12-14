from datetime import datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from app.repositories.booked_seat import booked_seat_repository
from app.repositories.seat import seat_repository

class SeatService:
    HOLD_MINUTES = 15

    def __init__(self):
        self.booked_repo = booked_seat_repository
        self.seat_repo = seat_repository


    def get_available_seats(self, db: Session, flight_id: int, seat_class: str = None) -> List[dict]:
        """
        Trả về toàn bộ ghế của máy bay
        """
        now = datetime.utcnow()
        
        if seat_class:
            all_seats = self.seat_repo.get_by_flight_and_class(db, flight_id, seat_class)
        else:
            all_seats = self.seat_repo.get_by_flight(db, flight_id)

        booked_seats = self.booked_repo.get_by_flight(db, flight_id)

        seat_status = {}
        for bs in booked_seats:
            if bs.reservation_id:
                seat_status[bs.id_seat] = "booked"
            elif bs.hold_expires and bs.hold_expires > now:
                seat_status[bs.id_seat] = "held"
        
        result = []
        for seat in all_seats:
            status = seat_status.get(seat.id, "available")

            result.append({
                "seat_id": seat.id,
                "seat_number": seat.seat_number,
                "seat_class": seat.seat_class,
                "status": status
            })

        return result

    def assert_seats_available(self, db: Session, flight_id: int, seat_ids: List[int]):
        valid_ids = [s.id for s in self.seat_repo.get_by_flight(db, flight_id)]
        for seat_id in seat_ids: 
            if seat_id not in valid_ids:
                raise ValueError(f"Ghế {seat_id} không tồn tại trên chuyến bay này")
            
        locked = self.booked_repo.get_locked_seats(db, flight_id, seat_ids)
        if locked:
            raise ValueError("Một số ghế bạn chọn đã được giữ hoặc đặt")
        
    def hold_seats(self, db: Session, flight_id: int, seat_ids: List[int]):
        self.assert_seats_available(db, flight_id, seat_ids)

        hold_expires = datetime.utcnow() + timedelta(minutes=self.HOLD_MINUTES)
        for seat_id in seat_ids:
            self.booked_repo.create_hold(db, flight_id=flight_id, seat_id=seat_id, hold_expires=hold_expires)

    def confirm_seats(self, db: Session, flight_id: int, reservation_id: int, seat_ids: List[int]):
        self.booked_repo.attach_reservation(db, flight_id, reservation_id, seat_ids)

    def release_by_reservation(self, db: Session, reservation_id: int):
        self.booked_repo.delete_by_reservation(db, reservation_id)

    def release_expired_holds(self, db: Session):
        expired_before = datetime.utcnow() - timedelta(minutes=self.HOLD_MINUTES)
        self.booked_repo.delete_expired_holds(db, expired_before)


seat_service = SeatService()
        