from pydantic import BaseModel, EmailStr
from datetime import date, datetime

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    address: str
    phone: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    address: str | None = None
    phone: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None


class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
