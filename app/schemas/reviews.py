from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReviewBase(BaseModel):
    user_id: int
    flight_id: int
    airline_id: int
    rating_overall: int
    rating_comfort: Optional[int]
    rating_service: Optional[int]
    rating_punctuality: Optional[int]
    comment_text: Optional[str]

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    user_id: Optional[int]
    flight_id: Optional[int]
    airline_id: Optional[int]
    rating_overall: Optional[int]
    rating_comfort: Optional[int]
    rating_service: Optional[int]
    rating_punctuality: Optional[int]
    comment_text: Optional[str]

class ReviewResponse(ReviewBase):
    id: int
    comment_date: datetime

    class Config:
        orm_mode = True
