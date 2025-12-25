from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.repositories.base import BaseRepository
from app.models.reservation_passenger import ReservationPassenger
from app.models.passenger import Passenger
from app.schemas.reservation_passenger import ReservationPassengerCreate, ReservationPassengerResponse


class ReservationPassengerRepository(BaseRepository[ReservationPassenger, ReservationPassengerCreate, ReservationPassengerResponse]):
    def __init__(self):
        super().__init__(ReservationPassenger)

    def exists(self, db: Session, reservation_id: int, passenger_id: int) -> bool:
        return (
            db.query(ReservationPassenger)
            .filter(
                ReservationPassenger.reservation_id == reservation_id,
                ReservationPassenger.passenger_id == passenger_id
            )
            .first()
            is not None
        )

    def count_by_reservation(self, db: Session, reservation_id: int) -> int:
        return (
            db.query(func.count(ReservationPassenger.id))
            .filter(ReservationPassenger.reservation_id == reservation_id)
            .scalar()
        )

    def get_by_reservation(self, db: Session, reservation_id: int) -> list[Passenger]:
        return (
            db.query(Passenger)
            .join(
                ReservationPassenger,
                ReservationPassenger.passenger_id == Passenger.id
            )
            .filter(
                ReservationPassenger.reservation_id == reservation_id
            )
            .all()
        )


reservation_passenger_repository = ReservationPassengerRepository()
