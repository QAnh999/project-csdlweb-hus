from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Staff, User
import schemas
from typing import List
from datetime import datetime

router = APIRouter(prefix="/managers", tags=["Managers"])

@router.get("/users", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    try:
        users = db.query(
            User.id,
            User.first_name,
            User.last_name,
            User.email,
            User.created_at
        ).filter(User.status == 'active'
        ).order_by(User.created_at.desc()).all()
        
        # Format response
        response = []
        for user in users:
            response.append({
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "created_at": user.created_at.date() if user.created_at else None
            })
        
        return response
    except Exception as e:
        print(f"Error getting users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/admins", response_model=List[schemas.AdminResponse])
def get_admins(db: Session = Depends(get_db)):
    try:
        admins = db.query(Staff).filter(
            Staff.status != 'deleted',
            Staff.role == 'Admin'
        ).order_by(Staff.admin_id).all()
        
        # Format response
        response = []
        for admin in admins:
            response.append({
                "admin_id": admin.admin_id,
                "admin_name": admin.admin_name,
                "full_name": admin.full_name,
                "role": admin.role,
                "email": admin.email,
                "status": admin.status
            })
        
        return response
    except Exception as e:
        print(f"Error getting admins: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/superadmins", response_model=List[schemas.AdminResponse])
def get_superadmins(db: Session = Depends(get_db)):
    try:
        superadmins = db.query(Staff).filter(
            Staff.status != 'deleted',
            Staff.role == 'Super Admin'
        ).order_by(Staff.admin_id).all()
        
        # Format response
        response = []
        for admin in superadmins:
            response.append({
                "admin_id": admin.admin_id,
                "admin_name": admin.admin_name,
                "full_name": admin.full_name,
                "role": admin.role,
                "email": admin.email,
                "status": admin.status
            })
        
        return response
    except Exception as e:
        print(f"Error getting superadmins: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/admins")
def create_admin(admin_data: schemas.AdminCreate, db: Session = Depends(get_db)):
    try:
        # Kiểm tra email đã tồn tại chưa
        existing = db.query(Staff).filter(Staff.email == admin_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Kiểm tra admin_name đã tồn tại chưa
        existing_name = db.query(Staff).filter(Staff.admin_name == admin_data.admin_name).first()
        if existing_name:
            raise HTTPException(status_code=400, detail="Admin name already exists")
        
        # Tạo admin mới
        db_admin = Staff(
            admin_name=admin_data.admin_name,
            password=admin_data.password,
            full_name=admin_data.full_name,
            role=admin_data.role,
            email=admin_data.email,
            is_active=True,
            status='work'
        )
        
        db.add(db_admin)
        db.commit()
        db.refresh(db_admin)
        
        return {
            "admin_id": db_admin.admin_id,
            "admin_name": db_admin.admin_name,
            "full_name": db_admin.full_name,
            "role": db_admin.role,
            "email": db_admin.email,
            "status": db_admin.status
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating admin: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/admins/{admin_id}")
def delete_admin(admin_id: int, db: Session = Depends(get_db)):
    try:
        admin = db.query(Staff).filter(
            Staff.admin_id == admin_id,
            Staff.role == 'Admin'  # Chỉ có thể xóa admin, không xóa superadmin
        ).first()
        
        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")
        
        # Chuyển status thành 'deleted' thay vì xóa
        admin.status = 'deleted'
        admin.is_active = False
        
        db.commit()
        
        return {"message": "Admin deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting admin: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")