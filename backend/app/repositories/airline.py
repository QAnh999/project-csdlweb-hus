from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.airline import Airline
from app.schemas.airline import AirlineCreate, AirlineUpdate

class AirlineRepository(BaseRepository[Airline, AirlineCreate, AirlineUpdate]):
    
    def __init__(self):
        super().__init__(Airline)

    def get_by_code(self, db: Session, code: str):
        return db.query(Airline).filter(Airline.code == code).first()
    

airline_repository = AirlineRepository()