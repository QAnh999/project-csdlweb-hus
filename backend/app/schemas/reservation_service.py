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

class ReservationServiceResponse(ReservationServiceBase):
    id: int

    class Config:
        from_attributes = True