from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.repositories.base import BaseRepository
from app.models.booked_seat import BookedSeat
from app.schemas.booked_seat import BookedSeatCreate, BookedSeatUpdate


class BookedSeatRepository(BaseRepository[BookedSeat, BookedSeatCreate, BookedSeatUpdate]):
    
    def __init__(self):
        super().__init__(BookedSeat)

    def get_by_flight(self, db: Session, flight_id: int) -> List[BookedSeat]:
        return db.query(BookedSeat).filter(BookedSeat.id_flight == flight_id).all()

    def get_locked_seats(self, db: Session, flight_id: int, seat_ids: List[int]) -> List[BookedSeat]:
        """
        Trả về ghế đang được giữ hoặc đã xác nhận
        """
        return (db.query(BookedSeat).filter(
            BookedSeat.id_flight == flight_id,
            BookedSeat.id_seat.in_(seat_ids),
            (
                (BookedSeat.reservation_id.isnot(None)) |
                (BookedSeat.hold_expires > datetime.utcnow())
            )
        ).with_for_update().all())
    
    def create_hold(self, db: Session, *, flight_id: int, seat_id: int, hold_expires: datetime) -> BookedSeat:
        booked = BookedSeat(
            id_flight=flight_id,
            id_seat=seat_id,
            reservation_id=None,
            hold_expires=hold_expires
        )
        db.add(booked)
        return booked
    
    def attach_reservation(self, db: Session, flight_id: int, reservation_id: int, seat_ids: List[int]) -> int:
        """
        Ghế được giữ -> xác nhận
        """
        result = db.query(BookedSeat).filter(
            BookedSeat.id_flight == flight_id,
            BookedSeat.id_seat.in_(seat_ids),
            BookedSeat.reservation_id.is_(None)
        ).update(
            {
                BookedSeat.reservation_id: reservation_id,
                BookedSeat.hold_expires: None
            },
            synchronize_session=False
        )
        if result != len(seat_ids):
            raise ValueError("Không thể xác nhận tất cả ghế, có thể đã bị giữ bởi người khác")
        return result
        
    

    def delete_by_reservation(self, db: Session, reservation_id: int) -> int:
        """
        Xóa khi ghế bị hủy
        """
        return db.query(BookedSeat).filter(BookedSeat.reservation_id == reservation_id).delete(synchronize_session=False)
    
    def delete_expired_holds(self, db: Session, expired_before: datetime) -> int:
        """
        Xóa ghế hết hạn giữ
        """
        return db.query(BookedSeat).filter(
            BookedSeat.reservation_id.is_(None),
            BookedSeat.hold_expires < expired_before
        ).delete(synchronize_session=False)



booked_seat_repository = BookedSeatRepository()