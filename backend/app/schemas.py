from pydantic import BaseModel, validator, Field, EmailStr
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
    # Thêm các trường để tự động config Swagger
    authorize_url: Optional[str] = None
    authorize_value: Optional[str] = None
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
    percentage: float

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

class FlightUpdate(BaseModel):
    flight_number: Optional[str] = None
    id_airline: Optional[int] = None
    id_aircraft: Optional[int] = None
    dep_airport: Optional[int] = None
    arr_airport: Optional[int] = None
    dep_datetime: Optional[datetime] = None
    arr_datetime: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    base_price_economy: Optional[Decimal] = None
    base_price_business: Optional[Decimal] = None
    base_price_first: Optional[Decimal] = None
    total_seats: Optional[int] = None
    available_seats_economy: Optional[int] = None
    available_seats_business: Optional[int] = None
    available_seats_first: Optional[int] = None
    status: Optional[str] = None
    gate: Optional[str] = None
    terminal: Optional[str] = None

# Booking Schemas
class BookingResponse(BaseModel):
    id: int
    reservation_code: str
    user_name: str
    email: EmailStr
    booking_time: datetime
    status: str
    total_amount: float
    total_passengers: int
    is_old: bool

class BookingListResponse(BaseModel):
    bookings: List[BookingResponse]
    total: int
    page: int
    limit: int
    has_more: bool

class PassengerDetail(BaseModel):
    passenger_id: int
    name: str
    seat_id: int
    total_fare: float

class FlightDetail(BaseModel):
    flight_id: Optional[int]
    flight_number: str
    departure: Optional[datetime]
    arrival: Optional[datetime]

class FlightInfo(BaseModel):
    main_flight: FlightDetail
    return_flight: Optional[FlightDetail]

class UserInfo(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    phone: Optional[str]

class PaymentInfo(BaseModel):
    payment_method: Optional[str]
    transaction_id: Optional[str]
    amount: float
    status: Optional[str]

class BookingDetails(BaseModel):
    total_passengers: int
    total_amount: float
    paid_amount: float
    discount_amount: float
    status: str
    created_at: datetime
    is_old: bool

class BookingDetailResponse(BaseModel):
    booking_id: int
    reservation_code: str
    user_info: UserInfo
    flight_info: FlightInfo
    booking_details: BookingDetails
    payment_info: Optional[PaymentInfo]
    passengers: List[PassengerDetail]

# Service Schemas - CHỈ CẦN 4 TRƯỜNG NHẬP VÀO
class ServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    base_price: Decimal

class ServiceResponse(BaseModel):
    id: int  # THÊM ID
    name: str
    description: Optional[str]
    category: str
    base_price: Decimal
    # KHÔNG CẦN is_available

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
    id: int  # THÊM TRƯỜNG ID
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
    full_name: str
    email: EmailStr
    joined_date: date

class UserDetailResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    status: str
    joined_date: Optional[date] = None
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class AdminCreate(BaseModel):
    admin_name: str
    email: EmailStr
    password: str
    full_name: str

class AdminResponse(BaseModel):
    admin_id: int
    admin_name: str
    full_name: str
    role: str
    email: EmailStr

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