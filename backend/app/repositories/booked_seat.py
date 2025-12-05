from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.booked_seat import BookedSeat
from app.repositories.base import BaseRepository
from app.schemas.booked_seats import BookedSeatCreate, BookedSeatUpdate

class BookedSeatRepository(BaseRepository[BookedSeat, BookedSeatCreate, BookedSeatUpdate]):
    
    def __init__(self):
        super().__init__(BookedSeat)

    def get_by_flight(self, db: Session, id_flight: int) -> List[BookedSeat]:
        return db.query(BookedSeat).filter(BookedSeat.id_flight == id_flight).all()
    
    def get_by_seat_and_flight(self, db: Session, id_seat: int) -> Optional[BookedSeat]:
        return db.query(BookedSeat).filter(BookedSeat.id_seat == id_seat).first()
    

booked_seat_repository = BookedSeatRepository()