from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class DailyStatsBase(BaseModel):
    stat_date: date
    completed_flights: Optional[int] = 0
    active_flights: Optional[int] = 0
    cancelled_flights: Optional[int] = 0
    total_revenue: Optional[float] = 0
    tickets_sold: Optional[int] = 0
    prev_completed_flights: Optional[int] = 0
    prev_active_flights: Optional[int] = 0
    prev_cancelled_flights: Optional[int] = 0
    prev_revenue: Optional[float] = 0
    prev_tickets_sold: Optional[int] = 0

class DailyStatsCreate(DailyStatsBase):
    pass

class DailyStatsUpdate(BaseModel):
    completed_flights: Optional[int]
    active_flights: Optional[int]
    cancelled_flights: Optional[int]
    total_revenue: Optional[float]
    tickets_sold: Optional[int]
    prev_completed_flights: Optional[int]
    prev_active_flights: Optional[int]
    prev_cancelled_flights: Optional[int]
    prev_revenue: Optional[float]
    prev_tickets_sold: Optional[int]

class DailyStatsResponse(DailyStatsBase):
    id: int
    calculated_at: datetime

    class Config:
        orm_mode = True
