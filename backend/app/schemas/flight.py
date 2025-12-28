from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime
from typing import Optional
from decimal import Decimal


class FlightBase(BaseModel):
    flight_number: str = Field(..., min_length=1, max_length=20)
    id_airline: int = Field(..., gt=0)
    id_aircraft: int = Field(..., gt=0)
    dep_airport: int = Field(..., gt=0)
    arr_airport: int = Field(..., gt=0)

    dep_datetime: datetime
    arr_datetime: datetime

    duration_minutes: int = Field(..., gt=0)

    base_price_economy: Decimal = Field(..., ge=0)
    base_price_business: Optional[Decimal] = Field(None, ge=0)
    base_price_first: Optional[Decimal] = Field(None, ge=0)

    luggage_fee_per_kg: Optional[Decimal] = Field(0, ge=0)
    free_luggage_weight: Optional[Decimal] = Field(20, ge=0)
    overweight_fee_per_kg: Optional[Decimal] = Field(0, ge=0)

    total_seats: int = Field(..., gt=0)
    available_seats_economy: int = Field(..., ge=0)
    available_seats_business: Optional[int] = Field(0, ge=0)
    available_seats_first: Optional[int] = Field(0, ge=0)

    status: Optional[str] = Field(
        "scheduled",
        pattern="^(scheduled|boarding|departed|arrived|cancelled|delayed)$"
    )
    gate: Optional[str] = Field(None, max_length=10)
    terminal: Optional[str] = Field(None, max_length=10)

    # ✅ arr_datetime > dep_datetime
    @field_validator("arr_datetime")
    @classmethod
    def validate_arrival_after_departure(cls, v, info):
        dep = info.data.get("dep_datetime")
        if dep and v <= dep:
            raise ValueError("Arrival datetime must be after departure datetime")
        return v

    # ✅ available seats không vượt total_seats
    @field_validator(
        "available_seats_economy",
        "available_seats_business",
        "available_seats_first"
    )
    @classmethod
    def validate_seats_not_exceed_total(cls, v, info):
        total = info.data.get("total_seats")
        if total is not None and v is not None and v > total:
            raise ValueError("Available seats cannot exceed total seats")
        return v


class FlightCreate(FlightBase):
    pass


class FlightUpdate(BaseModel):
    status: Optional[str] = Field(
        None,
        pattern="^(scheduled|boarding|departed|arrived|cancelled|delayed)$"
    )
    gate: Optional[str] = Field(None, max_length=10)
    terminal: Optional[str] = Field(None, max_length=10)

    available_seats_economy: Optional[int] = Field(None, ge=0)
    available_seats_business: Optional[int] = Field(None, ge=0)
    available_seats_first: Optional[int] = Field(None, ge=0)


class FlightResponse(BaseModel):
    id: int
    flight_number: str

    airline_name: Optional[str] = None
    airline_code: Optional[str] = None
    aircraft_model: Optional[str] = None

    dep_airport_code: Optional[str] = None
    dep_airport_name: Optional[str] = None
    dep_city: Optional[str] = None

    arr_airport_code: Optional[str] = None
    arr_airport_name: Optional[str] = None
    arr_city: Optional[str] = None

    dep_datetime: datetime
    arr_datetime: datetime
    duration_minutes: int

    base_price_economy: Decimal
    base_price_business: Optional[Decimal]
    base_price_first: Optional[Decimal]

    status: str
    gate: Optional[str]
    terminal: Optional[str]

    available_seats_economy: int
    available_seats_business: int
    available_seats_first: int

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
