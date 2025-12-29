from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, dashboard, flights, users

app = FastAPI(title="Flight Booking API")

# Cấu hình CORS để Frontend gọi được API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Trong production nên đổi thành domain cụ thể của bạn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký các Router
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(flights.router)
app.include_router(users.router)

@app.get("/")
async def root():
    return {"message": "Flight Booking API is running!"}