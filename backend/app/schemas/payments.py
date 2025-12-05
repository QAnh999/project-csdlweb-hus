from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaymentBase(BaseModel):
    reservation_id: int
    payment_method: str
    payment_gateway: Optional[str] = None
    transaction_id: Optional[str] = None
    currency: Optional[str] = "VND"
    status: Optional[str] = "pending"

class PaymentCreate(PaymentBase):
    pass 

class PaymentUpdate(BaseModel):
    status: Optional[str] = None

class PaymentResponse(PaymentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    paid_at: Optional[datetime] = None

    class Config:
        from_Attributes = True