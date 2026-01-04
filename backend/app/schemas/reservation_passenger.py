from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class ReservationPassengerBase(BaseModel):
    reservation_id: int
    passenger_id: int


class ReservationPassengerCreate(ReservationPassengerBase):
    pass


class ReservationPassengerResponse(ReservationPassengerBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
    
