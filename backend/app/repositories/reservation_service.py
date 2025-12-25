from sqlalchemy.orm import Session
from typing import List
from app.models.reservation_service import ReservationService
from app.repositories.base import BaseRepository
from app.schemas.reservation_service import ReservationServiceCreate, ReservationServiceUpdate

class ReservationServiceRepository(BaseRepository[ReservationService, ReservationServiceCreate, ReservationServiceUpdate]):

    def __init__(self):
        super().__init__(ReservationService)

    def get_by_reservation_detail(self, db: Session, reservation_detail_id: int) -> List[ReservationService]:
        return db.query(ReservationService).filter(ReservationService.reservation_detail_id == reservation_detail_id)
    
    def get_by_detail_and_service(self, db: Session, detail_id: int, service_id: int):
        return db.query(ReservationService).filter(
            ReservationService.reservation_detail_id == detail_id,
            ReservationService.service_id == service_id
        ).first()

reservation_service_repository = ReservationServiceRepository()
