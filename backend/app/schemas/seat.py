from pydantic import BaseModel, ConfigDict
from typing import Optional
from enum import Enum

class SeatType(str, Enum):
    window = "window"
    aisle = "aisle"
    middle = "middle"
    emergency = "emergency"

class SeatClass(str, Enum):
    economy = "economy"
    business = "business"
    first = "first"

class SeatBase(BaseModel):
    id_aircraft: int
    seat_number: str
    seat_class: SeatClass
    seat_type: SeatType
    # is_available: Optional[bool] = True
    price_surcharge: Optional[float] = 0

class SeatCreate(SeatBase):
    pass 

class SeatUpdate(BaseModel):
    id_aircraft: Optional[int] = None
    seat_number: Optional[str] = None
    seat_class: Optional[SeatClass] = None
    seat_type: Optional[SeatType] = None
    # is_available: Optional[bool] = None
    price_surcharge: Optional[float] = None

class SeatResponse(SeatBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
