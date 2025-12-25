from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.repositories.payment import payment_repository
from app.repositories.reservation import reservation_repository
from app.repositories.invoice import invoice_repository
from app.services.seat import seat_service

class PaymentService:
    def __init__(self):
        self.payment_repo = payment_repository
        self.reservation_repo = reservation_repository
        self.invoice_repo = invoice_repository
        self.seat_serv = seat_service

    def _assert_user(self, reservation, user_id: int):
        if reservation.user_id != user_id:
            raise ValueError("Bạn chưa được cấp quyền để thay đổi nội dung này")

    def create_payment(self, db: Session, user_id: int, reservation_id: int, method: str):
        try:
            reservation = self.reservation_repo.get(db, reservation_id)
            self._assert_user(reservation, user_id)

            if not reservation:
                raise ValueError("Mã đặt chỗ không tồn tại")
            
            if reservation.status != "pending":
                raise ValueError("Không thể thanh toán vì chỗ đã đặt không hợp lệ")
            
            if reservation.expires_at and reservation.expires_at < datetime.utcnow():
                raise ValueError("Không thể thanh toán vì chỗ đã đặt đã hết hạn")
            
            payment = self.payment_repo.create(db, {
                "reservation_id": reservation.id,
                "payment_method": method,
                "status": "pending"
            })
            
            db.commit()
            return payment
        except Exception as e:
            db.rollback()
            raise e
    
    def confirm_payment(self, db: Session, user_id: int, payment_id: int):
        try:
            payment = self.payment_repo.get(db, payment_id)
            if not payment:
                raise ValueError("Thanh toán không tồn tại")
            
            if payment.status != "pending":
                raise ValueError("Thanh toán đã được xử lý trước đó")
            
            reservation = self.reservation_repo.get(db, payment.reservation_id)
            self._assert_user(reservation, user_id)

            if not reservation:
                raise ValueError("Mã đặt chỗ không tồn tại")
            
            if reservation.status != "pending":
                raise ValueError("Không thể xác nhận thanh toán vì chỗ đã đặt không hợp lệ")
            
            if reservation.expires_at < datetime.utcnow():
                raise ValueError("Không thể xác nhận thanh toán vì chỗ đã đặt đã hết hạn")

            invoice = self.invoice_repo.get_by_reservation(db, reservation.id)
            if not invoice:
                raise ValueError("Hóa đơn ko tồn tại")

            main_seat_ids = [
                bs.id_seat for bs in reservation.booked_seats
                if bs.id_flight == reservation.main_flight_id and bs.reservation_id == reservation.id and bs.hold_expires > datetime.utcnow()
            ] 

            if main_seat_ids:
                self.seat_serv.confirm_seats(db, reservation.main_flight_id, reservation.id, main_seat_ids)

            if reservation.return_flight_id:
                return_seat_ids = [
                    bs.id_seat for bs in reservation.booked_seats
                    if bs.id_flight == reservation.return_flight_id and bs.reservation_id == reservation.id and bs.hold_expires > datetime.utcnow()
                ]
                if return_seat_ids:
                    self.seat_serv.confirm_seats(db, reservation.return_flight_id, reservation.id, return_seat_ids)

            self.payment_repo.update(db, payment, {
                "status": "completed",
                "paid_at": datetime.utcnow()
            })
            self.reservation_repo.update(db, reservation, {
                "status": "confirmed"
            })   
            self.invoice_repo.update(db, invoice, {
                "status": "paid"
            })

            db.commit()
            return payment
            
        except SQLAlchemyError as e:
            db.rollback()
            raise ValueError("Xác nhận thanh toán thất bại") from e
        

payment_service = PaymentService()