from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.airport import Airport
from app.schemas.airport import AirportCreate, AirportUpdate

class AirportRepository(BaseRepository[Airport, AirportCreate, AirportUpdate]):
    
    def __init__(self):
        super().__init__(Airport)
    

airline_repository = AirportRepository()