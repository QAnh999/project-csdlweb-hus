from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.reservation import Reservation
from repositories.base import BaseRepository
from app.schemas.reservations import ReservationCreate, ReservationUpdate

class ReservationRepository(BaseRepository[Reservation, ReservationCreate, ReservationUpdate]):
    
    def __init__(self):
        super().__init__(Reservation)

    def get_by_code(self, db: Session, reservatuon_code: str) -> Optional[Reservation]:
        return db.query(Reservation).filter(Reservation.reservation_code == reservatuon_code).first()
    
    def get_by_user(self, db: Session, user_id: int) -> List[Reservation]:
        return db.query(Reservation).filter(Reservation.user_id == user_id)
    
reservation_repository = ReservationRepository()
