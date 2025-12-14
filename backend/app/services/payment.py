from sqlalchemy.orm import Session
from app.repositories.payment import payment_repository
from app.repositories.reservation import reservation_repository
from app.services.seat import seat_service

class PaymentService:
    def __init__(self):
        self.payment_repo = payment_repository
        self.reservation_repo = reservation_repository
        self.seat_serv = seat_service

    def create_payment(self, db: Session, reservation_id: int, method: str):
        reservation = self.reservation_repo.get(db, reservation_id)
        if not reservation:
            raise ValueError("Mã đặt chỗ không tồn tại")
        if reservation.status != "pending":
            raise ValueError("Không thể thanh toán vì chỗ đã đặt không hợp lệ")
        
        return self.payment_repo.create(db, {
            "reservation_id": reservation.id,
            "payment_method": method,
            "status": "pending"
        })
    
    def confirm_payment(self, db: Session, payment_id: int):
        payment = self.payment_repo.get(db, payment_id)
        if not payment:
            raise ValueError("Mã thanh toán không tồn tại")

        self.payment_repo.update(db, payment, {"status": "completed"})
        return payment
    

payment_service = PaymentService()