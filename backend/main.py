from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.routers.user import router as user_router
from app.routers.auth import router as auth_router
from app.routers.flight import router as flight_router
from app.routers.booking import router as booking_router
from app.routers.checkin import router as checkin_router

app = FastAPI()

# Cấu hình CORS
origins = [
    "http://localhost:3000",  # địa chỉ FE React
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],    # cho phép GET, POST, OPTIONS, PUT, DELETE...
    allow_headers=["*"],
)

# Include các router
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(flight_router)
app.include_router(booking_router)
app.include_router(checkin_router)
