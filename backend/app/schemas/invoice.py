from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum

class InvoiceStatus(str, Enum):
    unpaid = "unpaid"
    paid = "paid"
    overdue = "overdue"
    cancelled = "cancelled"

class InvoiceBase(BaseModel):
    invoice_number: str
    reservation_id: int
    user_id: int
    due_date: datetime
    total_amount: float
    tax_amount: Optional[float] = 0
    status: Optional[InvoiceStatus] = InvoiceStatus.unpaid


class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    status: Optional[InvoiceStatus] = None

class InvoiceResponse(InvoiceBase):
    id: int
    issue_date: datetime

    model_config = ConfigDict(from_attributes=True)