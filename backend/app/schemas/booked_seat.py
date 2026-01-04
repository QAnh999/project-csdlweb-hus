from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BookedSeatBase(BaseModel):
    id_seat: int
    id_flight: int
    reservation_id: int
    # status: Optional[str] = "held"
    hold_expires: Optional[datetime] = None

class BookedSeatCreate(BookedSeatBase):
    pass

class BookedSeatUpdate(BaseModel):
    booked_at: datetime


