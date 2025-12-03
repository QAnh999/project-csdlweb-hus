from pydantic import BaseModel, EmailStr
from typing import Optional


# Basse
class AirlineBase(BaseModel):
    name: str
    code: str
    logo_url: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None


# Create
class AirlineCreate(AirlineBase):
    pass

# Update
class AirlineUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    logo_url: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None


# Response
class AirlineResponse(AirlineBase):
    id: int

    class Config:
        from_attributes = True