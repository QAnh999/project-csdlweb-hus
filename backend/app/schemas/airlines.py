from pydantic import BaseModel, EmailStr
from typing import Optional


class AirlineBase(BaseModel):
    name: str
    code: str
    logo_url: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None

class AirlineCreate(AirlineBase):
    pass

class AirlineUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    logo_url: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None

class AirlineResponse(AirlineBase):
    id: int

    class Config:
        from_attributes = True