from pydantic import BaseModel, EmailStr
from typing import Optional

class StaffBase(BaseModel):
    admin_name: str
    full_name: str
    role: str
    email: EmailStr
    is_active: Optional[bool] = True
    avatar: Optional[str]

class StaffCreate(StaffBase):
    password: str

class StaffUpdate(BaseModel):
    admin_name: Optional[str]
    full_name: Optional[str]
    role: Optional[str]
    email: Optional[EmailStr]
    is_active: Optional[bool]
    avatar: Optional[str]
    password: Optional[str]

class StaffResponse(StaffBase):
    admin_id: int

    class Config:
        orm_mode = True
