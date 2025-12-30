from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from enum import Enum

class PassengerType(str, Enum):
    adult = "adult"
    child = "child"
    infant = "infant"


class PassengerBase(BaseModel):
    user_id: Optional[int] = None
    first_name: str
    last_name: str
    date_of_birth: datetime
    gender: Optional[str] = None
    nationality: Optional[str] = None
    passport_number: Optional[str] = None
    passport_expiry: Optional[datetime] = None
    identify_number: Optional[str] = None
    passenger_type: Optional[PassengerType] = PassengerType.adult

class PassengerCreate(PassengerBase):
    pass

class PassengerUpdate(BaseModel):
    user_id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    passport_number: Optional[str] = None
    passport_expiry: Optional[datetime] = None
    identify_number: Optional[str] = None
    passenger_type: Optional[str] = None


class PassengerResponse(PassengerBase):
    id: int
    create_at: datetime
    update_at: datetime

    model_config = ConfigDict(from_attributes=True)
        