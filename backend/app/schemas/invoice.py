from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InvoiceBase(BaseModel):
    invoice_number: str
    reservation_id: int
    user_id: int
    due_date: datetime
    total_amount: float
    tax_amount: Optional[float] = 0
    status: Optional[str] = "unpaid"


class InvoiceCreate(InvoiceBase):
    pass 

class InvoiceResponse(InvoiceBase):
    id: int
    issue_date: datetime

    class Config:
        from_attributes = True