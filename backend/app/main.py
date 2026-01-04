from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime

# Import routers từ admin
from routers import dashboard, flights, bookings, services, feedbacks, promotions, managers, airports, aircrafts, airlines

# Import routers từ user
from routers.user import router as user_router
from routers.flight import router as flight_router
from routers.booking import router as booking_router
from routers.checkin import router as checkin_router
from routers.auth import router as auth_router

# Import database
from database import init_db

# Khởi tạo database
init_db()

app = FastAPI(
    title="Lotus Travel API", 
    version="1.0.0",
    description="API for Lotus Travel Flight Booking System",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký tất cả routers

# Admin routers
app.include_router(auth_router)  # Auth từ user (có thể dùng chung)
app.include_router(dashboard.router)
app.include_router(flights.router)
app.include_router(bookings.router)
app.include_router(services.router)
app.include_router(feedbacks.router)
app.include_router(promotions.router)
app.include_router(managers.router)
app.include_router(airports.router)
app.include_router(aircrafts.router)
app.include_router(airlines.router)

# User routers
app.include_router(user_router)
app.include_router(flight_router)
app.include_router(booking_router)
app.include_router(checkin_router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Lotus Travel API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": [
            "/auth/login",
            "/dashboard/daily-stats",
            "/flights/search",
            "/bookings/",
            "/services/",
            "/feedbacks/",
            "/promotions/",
            "/managers/users",
            "/airports/",
            "/aircrafts/",
            "/airlines/",
            "/booking/",
            "/flight/",
            "/checkin/",
            "/user/",
            
        ]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Lotus Travel Backend",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )