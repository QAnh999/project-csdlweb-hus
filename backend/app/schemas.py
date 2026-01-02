from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class LoginRequest(BaseModel):
    email: str
    password: str

class FlightCreate(BaseModel):
    flight_number: str
    id_airline: int
    id_aircraft: int
    dep_airport: int
    arr_airport: int
    dep_datetime: datetime
    arr_datetime: datetime
    available_seats_economy: int
    available_seats_business: int
    status: str = "scheduled"

class ServiceCreate(BaseModel):
    name: str
    description: Optional[str]
    base_price: Decimal
    category: str

class PromotionCreate(BaseModel):
    code: str
    name: str
    description: Optional[str]
    start_date: datetime
    end_date: datetime
    discount_value: Decimal

class StaffCreate(BaseModel):
    admin_name: str
    password: str
    full_name: str
    email: str
    role: str = "Admin"