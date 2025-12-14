from pydantic import BaseModel, ConfigDict
from typing import Optional

class SeatBase(BaseModel):
    id_aircraft: int
    seat_number: str
    seat_class: str
    seat_type: str
    is_available: Optional[bool] = True
    price_surcharge: Optional[float] = 0

class SeatCreate(SeatBase):
    pass 

class SeatUpdate(BaseModel):
    id_aircraft: Optional[int] = None
    seat_number: Optional[str] = None
    seat_class: Optional[str] = None
    seat_type: Optional[str] = None
    is_available: Optional[bool] = None
    price_surcharge: Optional[float] = None

class SeatResponse(SeatBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
