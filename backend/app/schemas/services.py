from pydantic import BaseModel
from typing import Optional


class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    base_price: float
    is_available: Optional[bool] = True

class ServiceCreate(ServiceBase):
    pass 

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    base_price: Optional[float] = None
    is_available: Optional[bool] = None

class ServiceResponse(ServiceBase):
    id: int
    
    class Config:
        from_attributes = True