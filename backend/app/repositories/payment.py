from sqlalchemy.orm import Session
from typing import Optional
from models import Payment
from repositories.base import BaseRepository
from schemas.payment import PaymentCreate, PaymentUpdate

class PaymentRepository(BaseRepository[Payment, PaymentCreate, PaymentUpdate]):
    
    def __init__(self):
        super().__init__(Payment)

    def get_by_transaction(self, db: Session, transaction_id: str) -> Optional[Payment]:
        return db.query(Payment).filter(Payment.transaction_id == transaction_id).first()
    
    def get_by_reversation(self, db: Session, reservation_id: int) -> Optional[Payment]:
        return db.query(Payment).filter(Payment.reservation_id == reservation_id).first()

payment_repository = PaymentRepository()