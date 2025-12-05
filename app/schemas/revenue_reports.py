from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional

class RevenueReportBase(BaseModel):
    report_type: str
    period_start: date
    period_end: date
    total_revenue: Optional[float] = 0
    revenue_from_tickets: Optional[float] = 0
    revenue_from_services: Optional[float] = 0
    total_refunds: Optional[float] = 0
    total_bookings: Optional[int] = 0
    confirmed_bookings: Optional[int] = 0
    cancelled_bookings: Optional[int] = 0
    new_customers: Optional[int] = 0
    avg_booking_value: Optional[float] = 0
    cancellation_rate: Optional[float] = 0
    customer_growth_rate: Optional[float] = 0
    is_finalized: Optional[bool] = False
    generated_by: Optional[int]

class RevenueReportCreate(RevenueReportBase):
    pass

class RevenueReportUpdate(BaseModel):
    report_type: Optional[str]
    period_start: Optional[date]
    period_end: Optional[date]
    total_revenue: Optional[float]
    revenue_from_tickets: Optional[float]
    revenue_from_services: Optional[float]
    total_refunds: Optional[float]
    total_bookings: Optional[int]
    confirmed_bookings: Optional[int]
    cancelled_bookings: Optional[int]
    new_customers: Optional[int]
    avg_booking_value: Optional[float]
    cancellation_rate: Optional[float]
    customer_growth_rate: Optional[float]
    is_finalized: Optional[bool]
    generated_by: Optional[int]

class RevenueReportResponse(RevenueReportBase):
    id: int
    generated_at: datetime

    class Config:
        orm_mode = True
