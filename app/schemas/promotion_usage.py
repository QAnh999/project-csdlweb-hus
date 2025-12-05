from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PromotionUsageBase(BaseModel):
    promotion_id: int
    reservation_id: int
    user_id: int
    discount_amount: float

class PromotionUsageCreate(PromotionUsageBase):
    pass

class PromotionUsageUpdate(BaseModel):
    promotion_id: Optional[int]
    reservation_id: Optional[int]
    user_id: Optional[int]
    discount_amount: Optional[float]

class PromotionUsageResponse(PromotionUsageBase):
    id: int
    used_at: datetime

    class Config:
        orm_mode = True
