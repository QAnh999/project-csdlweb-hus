from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login")
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    # 1. Tìm trong bảng Staff (Admin/Super Admin)
    staff = db.query(models.Staff).filter(models.Staff.email == data.email).first()
    if staff:
        if staff.status == 'deleted':
             raise HTTPException(400, "Tài khoản này đã bị xóa")
        if staff.password == data.password: # So sánh chuỗi cơ bản
            return {
                "status": "success",
                "role": staff.role.lower(), # admin hoặc superadmin
                "id": staff.admin_id,
                "name": staff.full_name
            }
    
    # 2. Tìm trong bảng User
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if user and user.password == data.password:
        return {
            "status": "success",
            "role": "user",
            "id": user.id,
            "name": f"{user.last_name} {user.first_name}"
        }

    raise HTTPException(401, "Email hoặc mật khẩu không chính xác")