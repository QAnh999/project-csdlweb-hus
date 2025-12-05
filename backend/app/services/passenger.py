from sqlalchemy.orm import Session
from app.repositories.passenger import passenger_repository
from app.models.passenger import Passenger

class PassengerService:
    def __init__(self, repository=passenger_repository):
        self.repository = repository

    