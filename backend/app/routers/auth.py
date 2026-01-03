# auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Staff
import schemas

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.LoginResponse)
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Tìm trong Staff trước
    staff = db.query(Staff).filter(
        Staff.email == login_data.email,
        Staff.password == login_data.password, # SO SÁNH TRỰC TIẾP (tạm thời)
        Staff.is_active == True
        # Có thể thêm điều kiện: Staff.status != 'deleted'
    ).first()

    if staff:
        token = f"staff_token_{staff.admin_id}"
        role = staff.role.lower().replace(" ", "_") # "Super Admin" -> "super_admin"
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": role,  # Trả về "super_admin" hoặc "admin"
            "user_id": staff.admin_id,
            "email": staff.email,
            "name": staff.full_name,
        }

    # Tìm trong User
    user = db.query(User).filter(
        User.email == login_data.email,
        User.password == login_data.password,
        User.status == 'active'
    ).first()

    if user:
        token = f"user_token_{user.id}"
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "user",  # Người dùng thường
            "user_id": user.id,
            "email": user.email,
            "name": f"{user.first_name} {user.last_name}",
        }

    raise HTTPException(status_code=401, detail="Invalid email or password")