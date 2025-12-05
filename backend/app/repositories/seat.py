from sqlalchemy.orm import Session
from typing import List
from app.models.seat import Seat
from repositories.base import BaseRepository
from app.schemas.seats import SeatCreate, SeatUpdate

class SeatRepository(BaseRepository[Seat, SeatCreate, SeatUpdate]):
    
    def __init__(self):
        super().__init__(Seat)

    def get_by_aircraft(self, db: Session, id_aircraft: int) -> List[Seat]:
        return db.query(Seat).filter(Seat.id_aircraft == id_aircraft).all()
    
    def get_available_by_flight_and_class(self, db: Session, id_aircraft: int, seat_class: str) -> List[Seat]:
        return db.query(Seat).filter(
            Seat.id_aircraft == id_aircraft,
            Seat.seat_class == seat_class,
            Seat.is_available == True
        ).all()
    
seat_repository = SeatRepository()