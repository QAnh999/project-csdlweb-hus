from sqlalchemy.orm import Session
from typing import Optional, List
from repositories.base import BaseRepository
from models import Passenger
from models import ReservationDetail
from schemas.passenger import PassengerCreate, PassengerUpdate


class PassengerRepository(BaseRepository[Passenger, PassengerCreate, PassengerUpdate]):

    def __init__(self):
        super().__init__(Passenger)

    def get_by_passport(self, db: Session, passport_number: str) -> Optional[Passenger]:
        return db.query(Passenger).filter(Passenger.passport_number == passport_number).first()
    
    def get_by_identify_number(self, db: Session, identify_number: str) -> Optional[Passenger]:
        return db.query(Passenger).filter(Passenger.identify_number == identify_number).first()
    
    def get_by_user(self, db: Session, user_id: int) -> List[Passenger]:
        return db.query(Passenger).filter(Passenger.user_id == user_id).first()
    
    def get_by_reservation(self, db: Session, reservation_id: int):
        return (
            db.query(Passenger)
            .join(ReservationDetail, Passenger.id == ReservationDetail.passenger_id)
            .filter(ReservationDetail.reservation_id == reservation_id)
            .distinct()
            .all()
        )
    
    def get_by_user_and_identity(
            self,
            db: Session,
            user_id: int,
            identify_number: Optional[str] = None,
            passport_number: Optional[str] = None
    ):
        query = db.query(Passenger).filter(Passenger.user_id == user_id)

        if identify_number:
            query = query.filter(Passenger.identify_number == identify_number)
        elif passport_number:
            query = query.filter(Passenger.passport_number == passport_number)
        else:
            return None
        
        return query.first()
    
passenger_repository = PassengerRepository()