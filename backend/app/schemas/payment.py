from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum

class PaymentStatus(str, Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"

class PaymentMethod(str, Enum):
    credit_card = "credit_card"
    bank_transfer = "bank_transfer"
    e_wallet = "e_wallet"

class PaymentBase(BaseModel):
    reservation_id: int
    payment_method: PaymentMethod
    payment_gateway: Optional[str] = None
    transaction_id: Optional[str] = None
    currency: Optional[str] = "VND"
    status: Optional[PaymentStatus] = PaymentStatus.pending

class PaymentCreate(PaymentBase):
    pass 

class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None

class PaymentResponse(PaymentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    paid_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)