from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FlightBase(BaseModel):
    flight_number: int
    id_airline: int
    id_aircraft: int
    dep_airport: int
    arr_airport: int
    dep_datetime: datetime
    arr_datetime: datetime
    duration_minutes: int

    base_price_economy: float
    base_price_business: Optional[float] = None
    base_price_first: Optional[float] = None

    luggage_fee_per_kg: Optional[float] = 0
    free_luggage_weight: Optional[float] = 20
    overweight_fee_per_kg: Optional[float] = 0

    total_seats: int
    available_seats_economy: int
    available_seats_business: Optional[int] = 0
    available_seats_first: Optional[int] = 0

    status: Optional[str] = "scheduled"
    gate: Optional[str] = None
    terminal: Optional[str] = None

class FlightCreate(FlightBase):
    pass 

class FlightUpdate(BaseModel):
    flight_number: Optional[int] = None
    id_airline: Optional[int] = None
    id_aircraft: Optional[int] = None
    dep_airport: Optional[int] = None
    arr_airport: Optional[int] = None
    dep_datetime: Optional[datetime] = None
    arr_datetime: Optional[datetime] = None
    duration_minutes: Optional[int] = None

    base_price_economy: float
    base_price_business: Optional[float] = None
    base_price_first: Optional[float] = None

    luggage_fee_per_kg: Optional[float] = None
    free_luggage_weight: Optional[float] = None
    overweight_fee_per_kg: Optional[float] = None

    total_seats: Optional[int] = None
    available_seats_economy: Optional[int] = None
    available_seats_business: Optional[int] = None
    available_seats_first: Optional[int] = None

    status: Optional[str] = None
    gate: Optional[str] = None
    terminal: Optional[str] = None


class FlightResponse(FlightBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config: 
        from_attributes = True

