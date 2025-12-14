from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ReservationBase(BaseModel):
    reservation_cpde: str
    user_id: int

    main_flight_id: int
    return_flight_id: Optional[int] = None

    total_passengers: int
    total_amount: float
    paid_amount: Optional[float] = 0
    discount_amount: Optional[float] = 0
    tax_amount: Optional[float] = 0

    status: Optional[str] = "pending"
    expires_at: Optional[datetime] = None

class ReservationCreate(ReservationBase):
    pass 


class ReservationUpdate(BaseModel):
    reservation_code: Optional[str] = None
    user_id: Optional[int] = None

    main_flight_id: Optional[int] = None
    return_flight_id: Optional[int] = None

    total_passengers: Optional[int] = None
    total_amount: Optional[float] = None
    paid_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    tax_amount: Optional[float] = None

    status: Optional[str] = None
    expires_at: Optional[datetime] = None


class ReservationResponse(ReservationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
