from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql.expression import exists
from typing import List
from app.models.reservation_detail import ReservationDetail
from app.models.passenger import Passenger
from app.models.reservation import Reservation
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
    
    def get_for_checkin(self, db: Session, reservation_code: str, personal_number: str) -> List[ReservationDetail]:
        return db.query(ReservationDetail)\
                .join(ReservationDetail.reservation)\
                .join(ReservationDetail.passenger)\
                .options(
                    joinedload(ReservationDetail.flight),
                    joinedload(ReservationDetail.passenger),
                    joinedload(ReservationDetail.seat)
                ).filter(
                    Reservation.reservation_code == reservation_code,
                    (
                        (Passenger.passport_number == personal_number) |
                        (Passenger.identify_number == personal_number)
                    )
                ).all()

    def exists(self, db: Session, reservation_id: int, passenger_id: int) -> bool:
        return db.query(
            exists().where(
                ReservationDetail.reservation_id == reservation_id,
                ReservationDetail.passenger_id == passenger_id
            )
        ).scalar()
    
    def count_by_reservation(self, db: Session, reservation_id: int) -> int:
        return db.query(ReservationDetail).filter(ReservationDetail.reservation_id == reservation_id).count()

    def get_passengers_by_reservation(self, db: Session, reservation_id: int) -> List[Passenger]:
        return db.query(Passenger)\
                .join(ReservationDetail, ReservationDetail.passenger_id == Passenger.id)\
                .filter(ReservationDetail.reservation_id == reservation_id)\
                .all()
    
    def get_by_flight_and_reservation(self, db: Session, flight_id: int, reservation_id: int) -> List[ReservationDetail]:
        return db.query(ReservationDetail).filter(
                    ReservationDetail.flight_id == flight_id,
                    ReservationDetail.reservation_id == reservation_id
                ).all()
    
    
reservation_detail_repository = ReservationDetailRepository()