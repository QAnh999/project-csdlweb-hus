from sqlalchemy.orm import Session
from typing import Optional
from app.models.payment import Payment
from repositories.base import BaseRepository
from app.schemas.payments import PaymentCreate, PaymentUpdate

class PaymentRepository(BaseRepository[Payment, PaymentCreate, PaymentUpdate]):
    
    def __init__(self):
        super().__init__(Payment)

    def get_by_transaction(self, db: Session, transaction_id: str) -> Optional[Payment]:
        return db.query(Payment).filter(Payment.transaction_id == transaction_id).first()
    
payment_repository = PaymentRepository()