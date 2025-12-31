from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class FlightCreate(BaseModel):
    flight_number: str
    id_airline: int
    id_aircraft: int
    dep_airport: int
    arr_airport: int
    dep_datetime: datetime
    arr_datetime: datetime
    status: str = "scheduled"
    # Thêm các trường cần thiết khác để insert

class ServiceBase(BaseModel):
    name: str
    description: Optional[str]
    base_price: Decimal

class PromotionCreate(BaseModel):
    code: str
    name: str
    description: Optional[str]
    start_date: datetime
    end_date: datetime
    discount_value: Decimal