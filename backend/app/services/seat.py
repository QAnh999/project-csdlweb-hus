from datetime import datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from repositories.booked_seat import booked_seat_repository
from repositories.seat import seat_repository

class SeatService:
    HOLD_MINUTES = 15

    def __init__(self):
        self.booked_repo = booked_seat_repository
        self.seat_repo = seat_repository

    def get_held_seats_for_reservation(self, db: Session, flight_id: int, reservation_id: int, seat_ids: List[int] = None):
        return self.booked_repo.get_held_seats_for_reservation(db, flight_id, reservation_id, seat_ids)

    def get_available_seats(self, db: Session, flight_id: int, seat_class: str) -> List[dict]:
        """
        Trả về toàn bộ ghế của máy bay
        """
        now = datetime.utcnow()
        
        all_seats = self.seat_repo.get_by_flight_and_class(db, flight_id, seat_class)

        booked = self.booked_repo.get_locked_seats(
            db, 
            flight_id,
            [s.id for s in all_seats],
            now=now,
            for_update=False
        )

        status_map = {}
        for b in booked:
            if b.reservation_id:
                status_map[b.id_seat] = "booked"
            elif b.hold_expires and b.hold_expires > now:
                status_map[b.id_seat] = "held"
        
        return [
            {
                "seat_id": seat.id,
                "seat_number": seat.seat_number,
                "seat_class": seat.seat_class,
                "status": status_map.get(seat.id, "available")
            }
            for seat in all_seats
        ]

    def hold_seats(self, db: Session, flight_id: int, reservation_id: int, seat_ids: List[int], seat_class: str):
        now = datetime.utcnow()

        self.release_expired_holds(db, now)

        hold_expires = now + timedelta(minutes=self.HOLD_MINUTES)

        seats = [
            s for s in self.seat_repo.get_by_flight_and_class(db, flight_id, seat_class)
            if s.id in seat_ids
        ]
        
        if len(seats) != len(seat_ids):
            raise ValueError("Một hoặc nhiều ghế không tồn tại hoặc không thuộc hạng ghế được chỉ định")

        for seat_id in seat_ids:
            if self.booked_repo.exists_for_reservation(db, reservation_id, seat_id):
                raise ValueError(f"Ghế {seat_id} đã được giữ bởi bạn trước đó")

        try:
            records = self.booked_repo.create_hold(
                db, 
                flight_id=flight_id, 
                reservation_id=reservation_id,
                seat_ids=seat_ids, 
                hold_expires=hold_expires
            )
            # db.commit()
            return records
        except Exception as e:
            # db.rollback()
            raise e
        
    def count_held_seats(self, db: Session, reservation_id: int, flight_id: int) -> int:
        now = datetime.utcnow()
        held_seats = self.booked_repo.get_held_seats_for_reservation(db, flight_id, reservation_id)
        return len([s for s in held_seats if s.hold_expires and s.hold_expires > now])

    def confirm_seats(self, db: Session, flight_id: int, reservation_id: int, seat_ids: List[int]):
        try:
            records = self.booked_repo.attach_reservation(
                db,
                flight_id=flight_id,
                reservation_id=reservation_id,
                seat_ids=seat_ids
            )
            db.commit()
            return records
        except Exception as e:
            db.rollback()
            raise e

    def release_by_reservation(self, db: Session, reservation_id: int):
        try:
            self.booked_repo.delete_by_reservation(db, reservation_id)
            db.commit()
        except Exception as e:
            db.rollback()
            raise e

    def release_expired_holds(self, db: Session, now: datetime = None):
        now = datetime.utcnow() if now is None else now
        try:
            self.booked_repo.delete_expired_holds(db, now)
            db.commit()
        except Exception as e:
            db.rollback()
            raise


seat_service = SeatService()
        