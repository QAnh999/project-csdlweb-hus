from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List
from datetime import datetime
from repositories.base import BaseRepository
from models import BookedSeat
from models import Reservation
from schemas.booked_seat import BookedSeatCreate, BookedSeatUpdate


class BookedSeatRepository(BaseRepository[BookedSeat, BookedSeatCreate, BookedSeatUpdate]):
    
    def __init__(self):
        super().__init__(BookedSeat)


    def get_by_reservation(self, db: Session, reservation_id: int) -> List[BookedSeat]:
        """
        Trả về ghế đã được xác nhận bởi mã đặt chỗ
        """
        return db.query(BookedSeat).filter(
            BookedSeat.reservation_id == reservation_id
        ).all()

    def get_locked_seats(self, db: Session, flight_id: int, seat_ids: List[int], now: datetime = None, for_update: bool = True) -> List[BookedSeat]:
        """
        Trả về ghế đang được giữ hoặc đã xác nhận
        """
        if now is None:
            now = datetime.utcnow()

        # q = db.query(BookedSeat).filter(
        #     BookedSeat.id_flight == flight_id,
        #     BookedSeat.id_seat.in_(seat_ids),
        #     or_(
        #         (BookedSeat.reservation_id.isnot(None)),
        #         and_(
        #             BookedSeat.reservation_id.is_(None),
        #             BookedSeat.hold_expires.isnot(None),
        #             BookedSeat.hold_expires > now
        #         )
        #     )
        # )

        q = (
            db.query(BookedSeat)
            .join(Reservation, BookedSeat.reservation_id == Reservation.id)
            .filter(
                BookedSeat.id_flight == flight_id,
                BookedSeat.id_seat.in_(seat_ids),
                or_(
                    Reservation.status == "confirmed",
                    and_(
                         Reservation.status == "pending",
                         BookedSeat.hold_expires.isnot(None),
                         BookedSeat.hold_expires > now
                    )
                )
            )
        )

        if for_update:
            q = q.with_for_update()
        
        return q.all()
    
    def create_hold(self, db: Session, *, flight_id: int, reservation_id: int, seat_ids: List[int], hold_expires: datetime) -> List[BookedSeat]:
        now = datetime.utcnow()
        # print(f"DEBUG create_hold: Starting - flight_id: {flight_id}, reservation_id: {reservation_id}, seat_ids: {seat_ids}, hold_expires: {hold_expires}")

        locked = self.get_locked_seats(db, flight_id, seat_ids, now=now, for_update=True)
        if locked:
            # print(f"DEBUG create_hold: Found locked seats: {len(locked)}")
            # for s in locked:
                # print(f"  - Seat ID: {s.id_seat}, Reservation ID: {s.reservation_id}, Hold expires: {s.hold_expires}")
            raise ValueError("Một hoặc nhiều ghế đã bị giữ hoặc đặt bởi người khác")
        # print(f"DEBUG create_hold: Creating {len(seat_ids)} hold records")
        records = [
            BookedSeat(
                id_flight=flight_id,
                id_seat=seat_id,
                reservation_id=reservation_id,
                hold_expires=hold_expires
            ) 
            for seat_id in seat_ids
        ]
        try:
            db.add_all(records)
            # db.flush()
            db.commit()
            for record in records:
                db.refresh(record)
        except Exception as e:
            db.rollback()
            raise ValueError("Không thể giữ ghế, có thể đã bị giữ hoặc đặt bởi người khác") from e
        # print(f"DEBUG create_hold: Successfully created {len(records)} holds")
        return records
    
    def get_held_seats_for_reservation(self, db: Session, flight_id: int, reservation_id: int, seat_ids: List[int] = None) -> List[BookedSeat]:
        
        now = datetime.utcnow()
        # print(f"DEBUG: Checking held seats - flight_id: {flight_id}, reservation_id: {reservation_id}, seat_ids: {seat_ids}, now: {now}")

        q = db.query(BookedSeat).filter(
            BookedSeat.id_flight == flight_id,
            BookedSeat.reservation_id == reservation_id,
            BookedSeat.hold_expires != None,
            BookedSeat.hold_expires > now
        )
        if seat_ids:
            q = q.filter(BookedSeat.id_seat.in_(seat_ids))
        held_seats = q.all()
        # print(f"DEBUG: Found {len(held_seats)} held seats")
        # for seat in held_seats:
            # print(f"  - Seat ID: {seat.id_seat}, Hold expires: {seat.hold_expires}")

        if seat_ids and len(held_seats) != len(seat_ids):
            missing_seats = set(seat_ids) - {seat.id_seat for seat in held_seats}
            raise ValueError(f"Một hoặc nhiều ghế không còn được giữ hoặc đã bị đặt. Ghế bị thiếu: {missing_seats}")
        return held_seats
    

    def attach_reservation(self, db: Session, flight_id: int, reservation_id: int, seat_ids: List[int]) -> int:
        """
        Ghế được giữ -> xác nhận
        """
        now = datetime.utcnow()
        locked = self.get_held_seats_for_reservation(db, flight_id, reservation_id, seat_ids)
        locked_seat_ids = [b.id_seat for b in locked]

        result = db.query(BookedSeat).filter(
            BookedSeat.id_flight == flight_id,
            BookedSeat.id_seat.in_(seat_ids),
            BookedSeat.reservation_id == reservation_id,
            BookedSeat.hold_expires.isnot(None),
            BookedSeat.hold_expires > now
        ).update(
            {
                BookedSeat.hold_expires: None
            },
            synchronize_session=False
        )

        if result != len(seat_ids):
            raise ValueError("Xác nhận ghế không thành công, vui lòng thử lại")

        return result
        
    def exists_for_reservation(self, db: Session, reservation_id: int, seat_id: int) -> bool:
        return db.query(BookedSeat).filter(
            BookedSeat.reservation_id == reservation_id,
            BookedSeat.id_seat == seat_id
        ).first() is not None

    def delete_by_reservation(self, db: Session, reservation_id: int) -> int:
        """
        Xóa khi ghế bị hủy
        """
        return db.query(BookedSeat).filter(
            BookedSeat.reservation_id == reservation_id
        ).delete(synchronize_session=False)
    
    def delete_expired_holds(self, db: Session, now: datetime) -> int:
        """
        Xóa ghế hết hạn giữ
        """
        # return db.query(BookedSeat).filter(
        #     BookedSeat.reservation_id.is_(None),
        #     BookedSeat.hold_expires != None,
        #     BookedSeat.hold_expires < now
        # ).delete(synchronize_session=False)
        expired_holds = (db.query(BookedSeat)
                .join(Reservation, BookedSeat.reservation_id == Reservation.id)
                .filter(
                    Reservation.status == "pending",
                    BookedSeat.hold_expires < now
                ).all())
        
        count = len(expired_holds)

        for seat in expired_holds:
            db.delete(seat)

        return count
            



booked_seat_repository = BookedSeatRepository()