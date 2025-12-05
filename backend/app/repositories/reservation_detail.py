from sqlalchemy.orm import Session 
from typing import List
from app.models.reservation_detail import ReservationDetail
from repositories.base import BaseRepository
from app.schemas.reservation_details import ReservationDetailCreate, ReservationDetailUpdate

class ReservationDetailRepository(BaseRepository[ReservationDetail, ReservationDetailCreate, ReservationDetailUpdate]):
    def __init__(self):
        super().__init__(ReservationDetail)

    def get_by_reservation(self, db: Session, reservation_id: int) -> List[ReservationDetail]:
        return db.query(ReservationDetail).filter(ReservationDetail.reservation_id == reservation_id).all()
    
reservation_detail_repository = ReservationDetailRepository()