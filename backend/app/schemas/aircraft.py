from pydantic import BaseModel, ConfigDict
from typing import Optional


class AircraftBase(BaseModel):
    model: str
    manufacture: Optional[str] = None
    capacity_economy: int
    capacity_business: Optional[int] = 0
    capacity_first: Optional[int] = 0
    id_airline: int

class AircraftCreate(AircraftBase):
    pass

class AircraftUpdate(BaseModel):
    model: Optional[str] = None
    manufacturer: Optional[str] = None
    capacity_economy: Optional[int] = None
    capacity_business: Optional[int] = None
    capacity_first: Optional[int] = None
    id_airline: Optional[int] = None


class AircraftResponse(AircraftBase):
    id: int
    total_capacity: int

    model_config = ConfigDict(from_attributes=True)