from sqlalchemy.orm import Session
from typing import Optional
from app.models.invoice import Invoice
from repositories.base import BaseRepository
from app.schemas.invoices import InvoiceCreate, InvoiceUpdate

class InvoiceRepository(BaseRepository[Invoice, InvoiceCreate, InvoiceUpdate]):
    
    def __init__(self):
        super().__init__(Invoice)

    def get_by_invoice_number(self, db: Session, invoice_number: int) -> Optional[Invoice]:
       return db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()

invoice_repository = InvoiceRepository() 