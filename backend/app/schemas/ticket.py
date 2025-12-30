from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum

class TicketStatus(str, Enum):
    active = "active"
    used = "used"
    refunded = "refunded"
    cancelled = "cancelled"

class TicketBase(BaseModel):
    ticket_number: str
    reservation_detail_id: int
    status: Optional[str] = "active"
    qr_code_url: Optional[str] = None
    pdf_url: Optional[str] = None

class TicketCreate(TicketBase):
    pass 

class TicketUpdate(BaseModel):
    status: Optional[str] = None

class TicketResponse(TicketBase):
    id: int
    issue_data: datetime

    model_config = ConfigDict(from_attributes=True)