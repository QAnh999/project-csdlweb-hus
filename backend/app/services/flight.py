from sqlalchemy.orm import Session
from app.repositories.flight import flight_repository
from app.models.flight import Flight

class FlightService:
    def __init__(self, repository=flight_repository):
        self.repository = repository

    