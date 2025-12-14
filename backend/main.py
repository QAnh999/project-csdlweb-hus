from fastapi import FastAPI
from app.routers.user import router as user_router
from app.routers.auth import router as auth_router
from app.routers.flight import router as flight_router
from app.routers.booking import router as booking_router

app = FastAPI()

app.include_router(user_router)
app.include_router(auth_router)
app.include_router(flight_router)
app.include_router(booking_router)