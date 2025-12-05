from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PromotionBase(BaseModel):
    code: str
    name: str
    description: Optional[str]
    discount_type: str
    discount_value: float
    min_order_amount: Optional[float] = 0
    max_discount_amount: Optional[float]
    usage_limit: Optional[int]
    start_date: datetime
    end_date: datetime
    is_active: Optional[bool] = True

class PromotionCreate(PromotionBase):
    pass

class PromotionUpdate(BaseModel):
    code: Optional[str]
    name: Optional[str]
    description: Optional[str]
    discount_type: Optional[str]
    discount_value: Optional[float]
    min_order_amount: Optional[float]
    max_discount_amount: Optional[float]
    usage_limit: Optional[int]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    is_active: Optional[bool]

class PromotionResponse(PromotionBase):
    id: int

    class Config:
        orm_mode = True
