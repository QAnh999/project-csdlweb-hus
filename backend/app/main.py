import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
from sqlalchemy import text # Import text
from .database import engine, Base, SessionLocal # Bỏ init_data
from . import models
from .routers import auth, dashboard, flights, bookings, services, feedbacks, promotions, managers

app = FastAPI(title="Lotus Airlines API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Vẫn giữ logic chờ DB khởi động, nhưng KHÔNG tạo bảng nữa
    retries = 10
    while retries > 0:
        try:
            print(f"⏳ Connecting to DB... ({retries} left)")
            
            # Thử kết nối đơn giản để xem DB sống chưa
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
                
            print("✅ Database connection established!")
            
            # --- QUAN TRỌNG: BỎ DÒNG create_all ĐI ---
            # Base.metadata.create_all(bind=engine) 
            # init_data() 
            # ---------------------------------------
            
            break
        except OperationalError:
            retries -= 1
            time.sleep(3)

 
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(flights.router)
app.include_router(bookings.router)
app.include_router(services.router)
app.include_router(feedbacks.router)
app.include_router(promotions.router)
app.include_router(managers.router)