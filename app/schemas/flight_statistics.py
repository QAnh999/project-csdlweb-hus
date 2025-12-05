from pydantic import BaseModel
from datetime import date
from typing import Optional

class FlightStatisticsBase(BaseModel):
    flight_id: int
    statistic_date: date
    total_bookings: Optional[int] = 0
    total_revenue: Optional[float] = 0
    occupancy_rate: Optional[float] = 0
    avg_ticket_price: Optional[float] = 0

class FlightStatisticsCreate(FlightStatisticsBase):
    pass

class FlightStatisticsUpdate(BaseModel):
    total_bookings: Optional[int]
    total_revenue: Optional[float]
    occupancy_rate: Optional[float]
    avg_ticket_price: Optional[float]

class FlightStatisticsResponse(FlightStatisticsBase):
    id: int

    class Config:
        orm_mode = True
