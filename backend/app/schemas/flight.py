from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import datetime, date
from enum import Enum

class FlightStatus(str, Enum):
    scheduled = "scheduled"
    boarding = "boarding"
    departed = "departed"
    arrived = "arrived"
    cancelled = "cancelled"
    delayed = "delayed"

class FlightBase(BaseModel):
    flight_number: str
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

    luggage_fee_per_kg: float = 0
    free_luggage_weight: float = 20
    overweight_fee_per_kg: float = 0

    total_seats: int
    available_seats_economy: int
    available_seats_business: int = 0
    available_seats_first: int = 0

    status: str = FlightStatus.scheduled
    gate: Optional[str] = None
    terminal: Optional[str] = None

class FlightCreate(FlightBase):
    pass 

class FlightUpdate(BaseModel):
    flight_number: Optional[str] = None
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

    status: Optional[FlightStatus] = None
    gate: Optional[str] = None
    terminal: Optional[str] = None


class FlightResponse(FlightBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class PassengerSummary(BaseModel):
    adult: int
    child: int
    infant: int

    def total(self) -> int:
        return self.adult + self.child + self.infant

class FlightSearchRequest(BaseModel):
    from_airport: int
    to_airport: int
    dep_date: date
    ret_date: Optional[date] = None
    trip_type: Literal["one-way", "round-trip"] = "one-way"

    cabin_class: Literal["economy", "business", "first"] = "economy"

    adult: int = 1
    child: int = 0
    infant: int = 0


class FlightSearchResult(BaseModel):
    flight_id: int
    flight_number: str
    airline_name: str
    # airline_code: str
    # airline_logo: str

    dep_airport: int
    arr_airport: int

    dep_datetime: datetime
    arr_datetime: datetime
    duration_minutes: int

    cabin_class: str
    price: float
    available_seats: int

    model_config = ConfigDict(from_attributes=True)

class FlightSearchResponse(BaseModel):
    passengers: PassengerSummary
    main_flights: list[FlightSearchResult]
    return_flights: Optional[list[FlightSearchResult]] = None

