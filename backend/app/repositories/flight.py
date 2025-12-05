from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta
from app.models.flight import Flight
from app.schemas.flights import FlightCreate, FlightUpdate
from repositories.base import BaseRepository

class FlightRepository(BaseRepository[Flight, FlightCreate, FlightUpdate]):

    def __init__(self):
        super().__init__(Flight)

    def get_by_flight_number(self, db: Session, flight_number: str) -> Optional[Flight]:
        return db.query(Flight).filter(Flight.flight_number == flight_number).first()
    
    def search(self, db: Session, dep_airport: int, arr_airport: int, date: datetime) -> List[Flight]:
        start = datetime(date.year, date.month, date.day)
        end = start + timedelta(days=1)
        return db.query(Flight).filter(
            Flight.dep_airport == dep_airport,
            Flight.arr_airport == arr_airport,
            Flight.dep_datetime >= start,
            Flight.dep_datetime < end
        ).all()
    
    def count_available_seats(self, db: Session, flight_id: int) -> Optional[int]:
        f = Flight.get(db, flight_id)
        if not f:
            return None
        return (f.available_seats_economy or 0) + (f.available_seats_business or 0) + (f.available_seats_first or 0)
    
flight_repository = FlightRepository()
