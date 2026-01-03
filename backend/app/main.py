from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from routers import (
    auth, dashboard, flights, bookings, services, 
    feedbacks, promotions, managers,
    airports, aircrafts, airlines  # THÊM 3 API MỚI
)
from database import init_db
from datetime import datetime

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
    allow_origins=["*"],  # Trong production nên chỉ định domain cụ thể
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký tất cả routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(flights.router)
app.include_router(bookings.router)
app.include_router(services.router)
app.include_router(feedbacks.router)
app.include_router(promotions.router)
app.include_router(managers.router)

# THÊM 3 ROUTERS MỚI
app.include_router(airports.router)
app.include_router(aircrafts.router)
app.include_router(airlines.router)

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
            # THÊM 3 ENDPOINTS MỚI
            "/airports/",
            "/aircrafts/",
            "/airlines/"
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