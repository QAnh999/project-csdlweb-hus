from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReservationDetailBase(BaseModel):
    reservation_id: int
    passenger_id: int
    flight_id: int
    seat_id: int

    base_fare: float
    seat_surcharge: Optional[float] = 0
    luggage_surcharge: Optional[float] = 0
    tax_fare: Optional[float] = 0
    total_fare: float

    luggage_count: Optional[int] = 0
    luggage_weight: Optional[float] = 0

    checkin_time: Optional[datetime] = None
    checkin_method: Optional[str] = "none"
    boarding_pass_code: Optional[str] = None
    checkin_status: Optional[str] = "not_checked_in"

class ReservationDetailCreate(ReservationDetailBase):
    pass 

class ReservationDetailResponse(ReservationDetailBase):
    id: int
    
    class Config:
        from_attributes = True