from sqlalchemy.orm import Session
from typing import Optional, List
from app.repositories.base import BaseRepository
from app.models.passenger import Passenger
from app.schemas.passenger import PassengerCreate, PassengerUpdate


class PassengerRepository(BaseRepository[Passenger, PassengerCreate, PassengerUpdate]):

    def __init__(self):
        super().__init__(Passenger)

    def get_by_passport(self, db: Session, passport_number: str) -> Optional[Passenger]:
        return db.query(Passenger).filter(Passenger.passport_number == passport_number).first()
    
    def get_by_identify_number(self, db: Session, identify_number: str) -> Optional[Passenger]:
        return db.query(Passenger).filter(Passenger.identify_number == identify_number).first()
    
    def get_by_user(self, db: Session, user_id: int) -> List[Passenger]:
        return db.query(Passenger).filter(Passenger.user_id == user_id).first()
    
    
passenger_repository = PassengerRepository()