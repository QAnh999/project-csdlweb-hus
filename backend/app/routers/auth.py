from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Staff
import schemas
from typing import Union

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.LoginResponse)
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Try to find in Staff table first - SO SÁNH CHUỖI CƠ BẢN
    staff = db.query(Staff).filter(
        Staff.email == login_data.email,
        Staff.password == login_data.password,  # SO SÁNH TRỰC TIẾP
        Staff.is_active == True
    ).first()
    
    if staff:
        # Staff login
        return {
            "access_token": "staff_token_" + str(staff.admin_id),
            "role": staff.role.lower().replace(" ", ""),
            "user_id": staff.admin_id,
            "email": staff.email,
            "name": staff.full_name
        }
    
    # Try to find in User table - SO SÁNH CHUỖI CƠ BẢN
    user = db.query(User).filter(
        User.email == login_data.email,
        User.password == login_data.password,  # SO SÁNH TRỰC TIẾP
        User.status == 'active'
    ).first()
    
    if user:
        # User login
        return {
            "access_token": "user_token_" + str(user.id),
            "role": "user",
            "user_id": user.id,
            "email": user.email,
            "name": f"{user.first_name} {user.last_name}"
        }
    
    raise HTTPException(status_code=401, detail="Invalid email or password")