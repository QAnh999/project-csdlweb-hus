from pydantic import BaseModel, validator, Field
from datetime import datetime, date
from typing import Optional, List
from decimal import Decimal

# Auth Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    email: str
    name: str

# Dashboard Schemas
class DailyStatsResponse(BaseModel):
    active_flights: int
    completed_flights: int
    total_revenue_today: Decimal
    new_users_today: int

class WeeklyRevenueResponse(BaseModel):
    day_of_week: str
    revenue: Decimal
    date: date

class MonthlyRevenueResponse(BaseModel):
    week_number: int
    revenue: Decimal

class WeeklyTicketsResponse(BaseModel):
    date: date
    tickets_sold: int
    revenue: Decimal

class RecentBookingResponse(BaseModel):
    user_name: str
    booking_id: int
    flight_number: str
    booking_time: str
    status: str

class PopularRouteResponse(BaseModel):
    departure_city: str
    arrival_city: str
    total_bookings: int

class PopularAirlinesResponse(BaseModel):
    airline_name: str
    percentage: float
    total_flights: int

# Flight Schemas - BỎ VALIDATE QUÁ STRICT
class FlightCreate(BaseModel):
    flight_number: str
    id_airline: int
    id_aircraft: int
    dep_airport: int
    arr_airport: int
    dep_datetime: datetime
    arr_datetime: datetime
    duration_minutes: int  # BỎ Field(..., gt=0)
    base_price_economy: Decimal
    base_price_business: Optional[Decimal] = None
    base_price_first: Optional[Decimal] = None
    total_seats: int  # BỎ Field(..., gt=0)
    available_seats_economy: int
    available_seats_business: Optional[int] = 0
    available_seats_first: Optional[int] = 0
    gate: Optional[str] = None
    terminal: Optional[str] = None

class FlightSearch(BaseModel):
    departure: Optional[str] = None
    arrival: Optional[str] = None
    departure_date: Optional[date] = None
    seat_class: Optional[str] = None

class FlightResponse(BaseModel):
    id: int
    flight_number: str
    airline_name: str
    departure_city: str
    arrival_city: str
    dep_datetime: datetime
    arr_datetime: datetime
    duration_minutes: int
    base_price_economy: Decimal
    base_price_business: Optional[Decimal]
    base_price_first: Optional[Decimal]
    available_seats_economy: int
    available_seats_business: int
    available_seats_first: int
    status: str
    gate: Optional[str]
    terminal: Optional[str]

# Booking Schemas
class BookingResponse(BaseModel):
    reservation_code: str
    user_name: str
    email: str
    booking_time: datetime
    status: str

# Service Schemas - CHỈ CẦN 4 TRƯỜNG NHẬP VÀO
class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    base_price: Decimal

class ServiceResponse(BaseModel):
    name: str
    description: Optional[str]
    category: str
    base_price: Decimal
    # BỎ id và is_available

class ServiceResponseFull(ServiceResponse):
    id: int
    is_available: bool

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    base_price: Optional[Decimal] = None
    is_available: Optional[bool] = None

# Feedback Schemas
class FeedbackResponse(BaseModel):
    user_name: str
    rating_overall: int
    comment_text: Optional[str]
    comment_date: date

# Promotion Schemas
class PromotionCreate(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    discount_type: str
    discount_value: Decimal
    min_order_amount: Optional[Decimal] = 0
    max_discount_amount: Optional[Decimal] = None
    usage_limit: Optional[int] = None
    start_date: datetime
    end_date: datetime
    # BỎ validator để tránh lỗi

class PromotionResponse(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str]
    start_date: date
    end_date: date
    status: str

# Manager Schemas
class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    created_at: date

class AdminResponse(BaseModel):
    admin_id: int
    admin_name: str
    full_name: str
    role: str
    email: str
    status: str

class AdminCreate(BaseModel):
    admin_name: str
    password: str
    full_name: str
    role: str = "Admin"
    email: str