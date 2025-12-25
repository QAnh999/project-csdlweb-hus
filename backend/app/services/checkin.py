from sqlalchemy.orm import Session
from app.repositories.reservation_detail import reservation_detail_repository
from app.repositories.ticket import ticket_repository
from datetime import datetime
from app.utils.generator import generate_boarding_pass_code, generate_qr_base64

class CheckinService:
    def __init__(self):
        self.repo = reservation_detail_repository

    def get_checkin_info(self, db: Session, code: str, number: str):
        details = self.repo.get_for_checkin(db, code, number)

        if not details:
            raise ValueError("Không tìm thấy thông tin hành khách")
        
        return [{
            "reservation_detail_id": d.id,
            "flight_number": d.flight.flight_number,
            "departure_time": d.flight.dep_datetime,
            "seat_number": d.seat.seat_number if d.seat else None,
            "passenger_name": f"{d.passenger.last_name} {d.passenger.first_name}",
            "checkin_status": d.checkin_status
        } for d in details]
    
    def confirm_checkin(self, db: Session, reservation_detail_id: int):
        detail = self.repo.get(db, reservation_detail_id)

        if not detail:
            raise ValueError("Không tìm thấy hành khách")
        
        if detail.checkin_status == "checked_in":
            raise ValueError("Hành khách đã check-in")
        
        boarding_pass_code = generate_boarding_pass_code()
        qr_code = generate_qr_base64(boarding_pass_code)
        
        self.repo.update(db, detail, {
            "checkin_status": "checked_in",
            "checkin_time": datetime.utcnow(),
            "checkin_method": "online"
        })

        ticket = ticket_repository.create(db, {
            "ticket_number": boarding_pass_code,
            "reservation_detail_id": detail.id,
            "qr_code": qr_code
        })


        return {
            "boarding_pass_code": boarding_pass_code,
            "qr_code": qr_code
        }