from pydantic import BaseModel
from typing import Optional

class SeatBase(BaseModel):
    id_aircraft: int
    seat_number: str
    seat_class: str
    seat_type: str
    is_available: Optional[bool] = True

class SeatCreate(SeatBase):
    pass 

class SeatUpdate(BaseModel):
    id_aircraft: Optional[int] = None
    seat_number: Optional[str] = None
    seat_class: Optional[str] = None
    seat_type: Optional[str] = None
    is_available: Optional[bool] = None

class SeatResponse(SeatBase):
    id: int

    class Config:
        from_attributes = True
