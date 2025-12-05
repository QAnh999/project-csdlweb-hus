from pydantic import BaseModel
from datetime import date
from typing import Optional

class RouteStatisticsBase(BaseModel):
    dep_airport_id: int
    arr_airport_id: int
    statistic_date: date
    total_passengers: Optional[int] = 0
    total_flights: Optional[int] = 0
    total_revenue: Optional[float] = 0
    average_load_factor: Optional[float] = 0

class RouteStatisticsCreate(RouteStatisticsBase):
    pass

class RouteStatisticsUpdate(BaseModel):
    dep_airport_id: Optional[int]
    arr_airport_id: Optional[int]
    statistic_date: Optional[date]
    total_passengers: Optional[int]
    total_flights: Optional[int]
    total_revenue: Optional[float]
    average_load_factor: Optional[float]

class RouteStatisticsResponse(RouteStatisticsBase):
    id: int

    class Config:
        orm_mode = True
