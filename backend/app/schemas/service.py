from pydantic import BaseModel, ConfigDict
from typing import Optional
from enum import Enum

# class ServiceCategory(str, Enum):
#     meal = "meal"
#     luggage = "luggage"
#     insurance = "insurance"
#     entertainment = "entertainment"


class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str # ServiceCategory
    base_price: float
    is_available: Optional[bool] = True

class ServiceCreate(ServiceBase):
    pass 

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None # Optional[ServiceCategory] = None
    base_price: Optional[float] = None
    is_available: Optional[bool] = None

class ServiceResponse(ServiceBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)