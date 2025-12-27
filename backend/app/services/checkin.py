from sqlalchemy.orm import Session
from app.repositories.reservation_detail import reservation_detail_repository
from app.repositories.ticket import ticket_repository
from datetime import datetime, timedelta
from app.utils.generator import generate_boarding_pass_code, generate_qr_base64


ONLINE_CHECKIN_OPEN_HOURS = 48
ONLINE_CHECKIN_CLOSE_MINUTES = 60
class CheckinService:

    def __init__(self):
        self.repo = reservation_detail_repository

    def get_checkin_info(self, db: Session, code: str):
        details = self.repo.get_for_checkin(db, code)
        if not details:
            raise ValueError("Không tìm thấy thông tin hành khách")

        now = datetime.utcnow()
        valid_details = []
        for d in details: 
            dep_time = d.flight.dep_datetime
            if dep_time - timedelta(hours=ONLINE_CHECKIN_OPEN_HOURS) <= now <= dep_time - timedelta(minutes=ONLINE_CHECKIN_CLOSE_MINUTES):
                valid_details.append(d)
        
        if not valid_details:
            raise ValueError("Rất tiếc! Quý hành khách chỉ có thể làm thủ tục online trong từ 48 đến 01 tiếng trước giờ bay")
        
        return [{
            "reservation_detail_id": d.id,
            "flight_number": d.flight.flight_number,
            "departure_time": d.flight.dep_datetime,
            "seat_number": d.seat.seat_number if d.seat else None,
            "passenger_name": f"{d.passenger.last_name} {d.passenger.first_name}",
            "checkin_status": d.checkin_status
        } for d in details]
    
    def confirm_checkin(self, db: Session, reservation_detail_id: int):
        try:
            detail = self.repo.get(db, reservation_detail_id)

            if not detail:
                raise ValueError("Không tìm thấy hành khách")
            
            if detail.checkin_status == "checked_in":
                raise ValueError("Hành khách đã check-in")
            
            dep_time = detail.flight.dep_datetime
            now = datetime.utcnow()
            if dep_time - timedelta(hours=ONLINE_CHECKIN_OPEN_HOURS) > now or now > dep_time - timedelta(minutes=ONLINE_CHECKIN_CLOSE_MINUTES):
                raise ValueError("Rất tiếc! Quý hành khách chỉ có thể làm thủ tục online trong từ 48 đến 01 tiếng trước giờ bay")
            
            if detail.flight.dep_datetime <= datetime.utcnow():
                raise ValueError("Không thể check-in cho chuyến bay đã khởi hành")
            
            boarding_pass_code = generate_boarding_pass_code()
            qr_code_url = generate_qr_base64(boarding_pass_code)
            
            self.repo.update(db, detail, {
                "checkin_status": "checked_in",
                "checkin_time": datetime.utcnow(),
                "checkin_method": "online",
                "boarding_pass_code": boarding_pass_code
            })

            ticket = ticket_repository.create(db, {
                "ticket_number": boarding_pass_code,
                "reservation_detail_id": detail.id,
                "qr_code_url": qr_code_url
            })

            
            db.commit()
            return {
                "boarding_pass_code": boarding_pass_code,
                "qr_code_url": qr_code_url,
                "passenger_name": f"{detail.passenger.last_name} {detail.passenger.first_name}",
                "flight_number": detail.flight.flight_number,
                "seat_number": detail.seat.seat_number if detail.seat else None,
                "checkin_time": detail.checkin_time
            }
        except Exception as e:
            db.rollback()
            raise e
        

checkin_service = CheckinService()
        
        