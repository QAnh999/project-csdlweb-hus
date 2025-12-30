from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime, date
from enum import Enum

class UserGender(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class UserStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    banned = "banned"
    deleted = "deleted"

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    address: str
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[UserGender] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[UserGender] = None

class UserResponse(UserBase):
    id: int
    status: UserStatus
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class UserPassword(BaseModel):
    # đổi mật khẩu
    current_password: str
    new_password: str





