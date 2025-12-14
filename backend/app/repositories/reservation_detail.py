from sqlalchemy.orm import Session, joinedload
from typing import List
from app.models.reservation_detail import ReservationDetail
from app.repositories.base import BaseRepository
from app.schemas.reservation_detail import ReservationDetailCreate, ReservationDetailUpdate

class ReservationDetailRepository(BaseRepository[ReservationDetail, ReservationDetailCreate, ReservationDetailUpdate]):
    def __init__(self):
        super().__init__(ReservationDetail)

    def get_by_reservation(self, db: Session, reservation_id: int) -> List[ReservationDetail]:
        return db.query(ReservationDetail).filter(ReservationDetail.reservation_id == reservation_id).all()
    
    def get_by_reservation_with_seat(self, db: Session, reservation_id: int) -> List[ReservationDetail]:
        return db.query(ReservationDetail)\
                .options(joinedload(ReservationDetail.seat))\
                .filter(ReservationDetail.reservation_id == reservation_id)\
                .all()
    

reservation_detail_repository = ReservationDetailRepository()