from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    address: str
    phone: Optional[str]
    date_of_birth: Optional[date]
    gender: Optional[str]

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr]
    first_name: Optional[str]
    last_name: Optional[str]
    address: Optional[str]
    phone: Optional[str]
    date_of_birth: Optional[date]
    gender: Optional[str]
    password: Optional[str]

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime]

    class Config:
        orm_mode = True
