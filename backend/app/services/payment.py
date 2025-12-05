from sqlalchemy.orm import Session
from app.repositories.payment import payment_repository

class PaymentService:
    def __init__(self, repository=payment_repository):
        self.repository = repository

    