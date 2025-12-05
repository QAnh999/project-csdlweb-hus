from pydantic import BaseModel
from typing import Optional


class ReservationServiceBase(BaseModel):
    reservation_detail_id: int
    service_id: int
    quantity: Optional[int] = 1
    unit_price: float
    total_price: float

class ReservationServiceCreate(ReservationServiceBase):
    pass 

class ReservationServiceUpdate(BaseModel):
    reservation_detail_id: Optional[int] = None
    service_id: Optional[int] = None
    quantity: Optional[int] = None
    unit_price: Optional[int] = None
    total_price: Optional[float] = None

class ReservationServiceResponse(ReservationServiceBase):
    id: int

    class Config:
        from_attributes = True