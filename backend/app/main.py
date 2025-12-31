from fastapi import FastAPI
from .database import engine, Base
from .routers import auth, dashboard, flights, bookings, services, feedbacks, promotions, managers

# Khởi tạo App
app = FastAPI(title="Lotus Airline API")

# Import Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(flights.router)
app.include_router(bookings.router)
app.include_router(services.router)
app.include_router(feedbacks.router)
app.include_router(promotions.router)
app.include_router(managers.router)

# Event startup để tạo bảng (chạy async)
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # Nếu DB đã có bảng từ file SQL của bạn thì dòng này sẽ bỏ qua
        # Nếu chưa có thì nó sẽ tạo mới dựa trên models.py
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
def root():
    return {"message": "Lotus Airline API is running with AsyncPG!"}