from sqlalchemy.orm import Session
from typing import Optional
from models import Invoice
from repositories.base import BaseRepository
from schemas.invoice import InvoiceCreate, InvoiceUpdate

class InvoiceRepository(BaseRepository[Invoice, InvoiceCreate, InvoiceUpdate]):
    
    def __init__(self):
        super().__init__(Invoice)

    def get_by_invoice_number(self, db: Session, invoice_number: int) -> Optional[Invoice]:
        return db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()

    def get_by_reservation(self, db: Session, reservation_id: int) -> Optional[Invoice]:
        return db.query(Invoice).filter(Invoice.reservation_id == reservation_id).first()
invoice_repository = InvoiceRepository() 