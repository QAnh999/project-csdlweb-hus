# auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Staff
import schemas.admin_schemas as schemas
from core.security import verify_password, create_access_token, create_refresh_token


router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.LoginResponse)
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint - Xác thực cho cả Admin (Staff) và User
    
    Logic:
    1. Tìm trong bảng Staff trước (Admin/Super Admin)
    2. Nếu không tìm thấy, tìm trong bảng User (Customer)
    3. Verify password bằng bcrypt hash
    4. Tạo JWT token với thông tin user và role
    """
    
    # Bước 1: Tìm trong bảng Staff (Admin)
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


    # Bước 2: Tìm trong bảng User (Customer)
    user = db.query(User).filter(
        User.email == login_data.email,
        User.status == 'active'
    ).first()

    if user:
        # Verify password (so sánh hash)
        if not verify_password(login_data.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Tạo JWT token
        token_data = {
            "user_id": user.id,
            "email": user.email,
            "role": "user",
            "user_type": "customer"
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "role": "user",
            "user_id": user.id,
            "email": user.email,
            "name": f"{user.first_name} {user.last_name}",
        }

    # Không tìm thấy user hoặc staff
    raise HTTPException(status_code=401, detail="Invalid email or password")