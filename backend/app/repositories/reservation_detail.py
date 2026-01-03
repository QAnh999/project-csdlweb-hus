from sqlalchemy import func, distinct
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

    def get_for_checkin(self, db: Session, reservation_code: str, flight_id) -> List[ReservationDetail]:
        # Fetch reservation ID first (avoid join)
        reservation = db.query(Reservation).filter(
            Reservation.reservation_code == reservation_code,
            Reservation.status == "confirmed"
        ).first()
        if not reservation:
            print(f"get_for_checkin: No confirmed reservation for {reservation_code}")
            return []
        
        res_id = reservation.id
        print(f"get_for_checkin: Reservation ID {res_id}")
        
        # Subquery dedup: Chọn MAX(id) per passenger (+ flight nếu có) để handle duplicate
        subq = db.query(
            ReservationDetail.passenger_id,
            func.max(ReservationDetail.id).label('max_id')
        ).filter(ReservationDetail.reservation_id == res_id)
        
        subq = subq.filter(ReservationDetail.flight_id == flight_id)
        
        subq = subq.group_by(ReservationDetail.passenger_id).subquery()  # Dedup here
        
        # Main query: Join subq để lấy đúng 1 detail per passenger
        query = db.query(ReservationDetail).join(
            subq,
            (ReservationDetail.passenger_id == subq.c.passenger_id) &
            (ReservationDetail.id == subq.c.max_id)
        ).options(
            joinedload(ReservationDetail.flight),
            joinedload(ReservationDetail.passenger),
            joinedload(ReservationDetail.seat)
        )
        
        result = query.all()
        
        # Logging
        raw_count = db.query(ReservationDetail).filter(ReservationDetail.reservation_id == res_id).count()
        if flight_id:
            raw_count = db.query(ReservationDetail).filter(
                ReservationDetail.reservation_id == res_id, ReservationDetail.flight_id == flight_id
            ).count()
        print(f"get_for_checkin: Raw DB rows: {raw_count}, Deduped result: {len(result)}")
        
        return result

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

    # def get_for_checkin(self, db: Session, reservation_code: str, flight_id: int) -> List[ReservationDetail]:
    #     result = db.query(ReservationDetail)\
    #             .join(ReservationDetail.reservation)\
    #             .join(ReservationDetail.passenger)\
    #             .join(ReservationDetail.flight) \
    #             .options(
    #                 joinedload(ReservationDetail.flight),
    #                 joinedload(ReservationDetail.passenger),
    #                 joinedload(ReservationDetail.seat)
    #             ).filter(
    #                 Reservation.reservation_code == reservation_code,
    #                 Reservation.status == "confirmed",
    #                 ReservationDetail.flight_id == flight_id
    #                 # (
    #                 #     (Passenger.passport_number == personal_number) |
    #                 #     (Passenger.identify_number == personal_number)
    #                 # )
    #             ).all()
    #     print(f"get_for_checkin: Found {len(result)} records")
    #     return result
    
    # def get_for_checkin(self, db: Session, reservation_code: str) -> List[ReservationDetail]:
    #     result = db.query(ReservationDetail)\
    #             .join(ReservationDetail.reservation)\
    #             .join(ReservationDetail.passenger)\
    #             .join(ReservationDetail.flight) \
    #             .options(
    #                 joinedload(ReservationDetail.flight),
    #                 joinedload(ReservationDetail.passenger),
    #                 joinedload(ReservationDetail.seat)
    #             ).filter(
    #                 Reservation.reservation_code == reservation_code,
    #                 Reservation.status == "confirmed",
    #                 # (
    #                 #     (Passenger.passport_number == personal_number) |
    #                 #     (Passenger.identify_number == personal_number)
    #                 # )
    #             ).all()
    #     print(f"get_for_checkin: Found {len(result)} records")
    #     return result

    # def get_for_checkin(self, db: Session, reservation_code: str) -> List[ReservationDetail]:
    #     result = db.query(ReservationDetail)\
    #             .join(ReservationDetail.reservation)\
    #             .options(
    #                 joinedload(ReservationDetail.flight),
    #                 joinedload(ReservationDetail.passenger),
    #                 joinedload(ReservationDetail.seat)
    #             ).filter(
    #                 Reservation.reservation_code == reservation_code,
    #                 Reservation.status == "confirmed",
    #                 # (
    #                 #     (Passenger.passport_number == personal_number) |
    #                 #     (Passenger.identify_number == personal_number)
    #                 # )
    #             ).all()
    #     print(f"get_for_checkin: Found {len(result)} records")
    #     return result
    
    # def get_for_checkin(self, db: Session, reservation_code: str) -> List[ReservationDetail]:
    #     result = db.query(ReservationDetail)\
    #             .join(ReservationDetail.reservation)\
    #             .options(
    #                 joinedload(ReservationDetail.flight),
    #                 joinedload(ReservationDetail.passenger),
    #                 joinedload(ReservationDetail.seat)
    #             ).filter(
    #                 Reservation.reservation_code == reservation_code,
    #                 Reservation.status == "confirmed",
    #                 # (
    #                 #     (Passenger.passport_number == personal_number) |
    #                 #     (Passenger.identify_number == personal_number)
    #                 # )
    #             ).all()
    #     print(f"get_for_checkin: Found {len(result)} records")
    #     return result
    
    # def get_for_checkin(self, db: Session, reservation_code: str, flight_id: int = None) -> List[ReservationDetail]:
    #     # Bước 1: Fetch reservation ID trước (an toàn, không join)
    #     reservation = db.query(Reservation).filter(
    #         Reservation.reservation_code == reservation_code,
    #         Reservation.status == "confirmed"
    #     ).first()
    #     if not reservation:
    #         print(f"get_for_checkin: No confirmed reservation for {reservation_code}")
    #         return []
        
    #     res_id = reservation.id
    #     print(f"get_for_checkin: Using reservation ID {res_id}")
        
    #     # Bước 2: Query details KHÔNG JOIN - filter trực tiếp
    #     query = db.query(ReservationDetail)\
    #             .options(
    #                 joinedload(ReservationDetail.flight),
    #                 joinedload(ReservationDetail.passenger),
    #                 joinedload(ReservationDetail.seat)
    #             ).filter(
    #                 ReservationDetail.reservation_id == res_id
    #             )
        
    #     # Filter flight nếu có
    #     if flight_id:
    #         query = query.filter(ReservationDetail.flight_id == flight_id)
    #         print(f"get_for_checkin: Also filtering by flight_id {flight_id}")
        
    #     # Force distinct để tránh multiply (nếu ORM weird)
    #     query = query.distinct(ReservationDetail.id)
        
    #     # Log SQL generated (tạm thời cho debug)
    #     print(f"get_for_checkin: Generated SQL: {query}")
        
    #     result = query.all()
        
    #     # Logging chi tiết
    #     raw_count = db.query(func.count(ReservationDetail.id)).filter(
    #         ReservationDetail.reservation_id == res_id
    #     ).scalar()
    #     if flight_id:
    #         raw_count = db.query(func.count(ReservationDetail.id)).filter(
    #             ReservationDetail.reservation_id == res_id,
    #             ReservationDetail.flight_id == flight_id
    #         ).scalar()
    #     print(f"get_for_checkin: Raw DB count: {raw_count}, Query result: {len(result)}")
    #     if len(result) != raw_count:
    #         print("WARNING: Mismatch! Check DB integrity or models.")
        
    #     # List passenger_ids để verify unique
    #     pass_ids = [rd.passenger_id for rd in result]
    #     print(f"Passenger IDs: {pass_ids} (unique: {len(set(pass_ids))})")
        
    #     return result