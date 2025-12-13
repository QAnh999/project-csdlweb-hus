from fastapi import FastAPI
from app.routers.staff import router as staff_router

app = FastAPI()

# Đăng ký router
app.include_router(staff_router, prefix="/staff", tags=["Staff"])

@app.get("/")
def root():
    return {"message": "API is running!"}
