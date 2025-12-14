from pydantic import BaseModel, ConfigDict
from typing import Optional

class AirportBase(BaseModel):
    name: str
    city: str
    country: str
    iata: Optional[str] = None
    icao: Optional[str] = None

class AirportCreate(AirportBase):
    pass

class AirportUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    iata: Optional[str] = None
    icao: Optional[str] = None

class AirportResponse(AirportBase):
    id: int

    model_config = ConfigDict(from_attributes=True)