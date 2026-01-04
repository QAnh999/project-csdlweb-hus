from sqlalchemy.orm import Session
from typing import List
from models import Seat, Flight
from repositories.base import BaseRepository
from schemas.seat import SeatCreate, SeatUpdate

class SeatRepository(BaseRepository[Seat, SeatCreate, SeatUpdate]):
    
    def __init__(self):
        super().__init__(Seat)

    def get_by_aircraft(self, db: Session, id_aircraft: int) -> List[Seat]:
        return db.query(Seat).filter(Seat.id_aircraft == id_aircraft).all()
    
    def get_by_class(self, db: Session, id_aircraft: int, seat_class: str) -> List[Seat]:
        return db.query(Seat).filter(
            Seat.id_aircraft == id_aircraft,
            Seat.seat_class == seat_class
        ).all()
    
    def get_by_flight(self, db: Session, flight_id: int) -> List[Seat]:
        flight = db.query(Flight).filter(Flight.id == flight_id).first()
        if not flight or not flight.id_aircraft:
            raise ValueError("Chuyến bay không tồn tại")
        
        return db.query(Seat).filter(Seat.id_aircraft == flight.id_aircraft).all()
    
    def get_by_flight_and_class(self, db: Session, flight_id: int, seat_class: str) -> List[Seat]:
        flight = db.query(Flight).filter(Flight.id == flight_id).first()
        if not flight or not flight.id_aircraft:
            raise ValueError("Chuyến bay không tồn tại")
        
        return db.query(Seat).filter(Seat.id_aircraft == flight.id_aircraft, Seat.seat_class == seat_class).all()
    
    def get_by_ids(self, db: Session, seat_ids: list[int]):
        return db.query(Seat).filter(Seat.id.in_(seat_ids)).all()

seat_repository = SeatRepository()