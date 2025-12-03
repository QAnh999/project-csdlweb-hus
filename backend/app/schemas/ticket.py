from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TicketBase(BaseModel):
    ticket_number: str
    reservation_detail_id: int
    status: Optional[str] = "active"
    qr_code_url: Optional[str] = None
    pdf_url: Optional[str] = None

class TicketCreate(TicketBase):
    pass 

class TicketResponse(TicketBase):
    id: int
    issue_data: datetime

    class Config:
        from_attributes = True