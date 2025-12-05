from sqlalchemy.orm import Session
from app.repositories.reservation import reservation_repository
from app.models.reservation import Reservation
class ReservationService:
    def __init__(self, repository = reservation_repository):
        self.repository = repository

