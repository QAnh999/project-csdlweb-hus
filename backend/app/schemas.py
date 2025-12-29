from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, date

# =======================
# 1. AUTH & TOKENS
# =======================
class LoginSchema(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    accessToken: str
    refreshToken: str
    user: dict

# =======================
# 2. USERS (Sửa lỗi thiếu UserResponse ở đây)
# =======================
class UserBase(BaseModel):
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # Quan trọng để đọc dữ liệu từ SQLAlchemy

# =======================
# 3. HELPER SCHEMAS (Cho Flights)
# =======================
class AirlineSimple(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None
    class Config:
        from_attributes = True

class AirportSimple(BaseModel):
    id: int
    name: str
    city: str
    iata: Optional[str] = None
    class Config:
        from_attributes = True

class AircraftSimple(BaseModel):
    id: int
    model: str
    class Config:
        from_attributes = True

# =======================
# 4. FLIGHTS
# =======================
class FlightBase(BaseModel):
    flight_number: str
    dep_datetime: datetime
    arr_datetime: datetime
    duration_minutes: int
    base_price_economy: float
    status: str

# Dùng khi tạo chuyến bay (Input ID)
class FlightCreate(FlightBase):
    id_airline: int
    id_aircraft: int
    dep_airport: int
    arr_airport: int
    total_seats: int
    available_seats_economy: int

# Dùng khi hiển thị (Output Object đầy đủ)
class FlightResponse(FlightBase):
    id: int
    airline: Optional[AirlineSimple] = None
    departure_airport: Optional[AirportSimple] = None
    arrival_airport: Optional[AirportSimple] = None
    aircraft: Optional[AircraftSimple] = None
    
    class Config:
        from_attributes = True

# =======================
# 5. DASHBOARD
# =======================
class OverviewResponse(BaseModel):
    completedFlights: int
    activeFlights: int
    cancelledFlights: int
    totalRevenue: float
    ticketsSold: int
    growthRates: dict
    popularAirlines: List[str] = [] 
    topRoutes: List[str] = []