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

class ReservationDetailUpdate(BaseModel):
    reservation_id: Optional[int] = None
    passenger_id: Optional[int] = None
    flight_id: Optional[int] = None
    seat_id: Optional[int] = None

    base_fare: Optional[float] = None
    seat_surcharge: Optional[float] = None
    luggage_surcharge: Optional[float] = None
    tax_fare: Optional[float] = None
    total_fare: Optional[float] = None

    luggage_count: Optional[int] = None
    luggage_weight: Optional[float] = None

    checkin_time: Optional[datetime] = None
    checkin_method: Optional[str] = None
    boarding_pass_code: Optional[str] = None
    checkin_status: Optional[str] = None


class ReservationDetailResponse(ReservationDetailBase):
    id: int
    
    class Config:
        from_attributes = True