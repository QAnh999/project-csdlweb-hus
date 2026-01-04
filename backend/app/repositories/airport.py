from sqlalchemy.orm import Session
from repositories.base import BaseRepository
from models import Airport
from schemas.airport import AirportCreate, AirportUpdate

class AirportRepository(BaseRepository[Airport, AirportCreate, AirportUpdate]):
    
    def __init__(self):
        super().__init__(Airport)
    

airline_repository = AirportRepository()