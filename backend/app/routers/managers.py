# routers/managers.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models import Staff, User
from schemas import AdminCreate, AdminResponse, UserResponse, UserDetailResponse  # THÊM UserDetailResponse Ở ĐÂY
from dependencies import get_current_super_admin, get_current_admin

router = APIRouter(prefix="/managers", tags=["Managers"])

# 1. XÓA ADMIN (CHỈ SUPER ADMIN) - Chỉ đổi status thành 'deleted'
@router.delete("/admins/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin(
    admin_id: int,
    current_user: dict = Depends(get_current_super_admin),  # CHỈ super admin
    db: Session = Depends(get_db)
):
    # Không cho xóa chính mình
    if admin_id == current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    admin = db.query(Staff).filter(Staff.admin_id == admin_id).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    # Xóa mềm: chỉ đổi status thành 'deleted'
    admin.status = 'deleted'
    admin.is_active = False
    db.commit()
    
    return  # 204 No Content
@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_user: dict = Depends(get_current_admin),  # ✅ CẢ Admin VÀ Super Admin đều được
    db: Session = Depends(get_db)
):
    """
    Xóa user - chỉ chuyển status thành 'deleted'
    Admin và Super Admin đều có quyền xóa user
    """
    # Tìm user
    user = db.query(User).filter(
        User.id == user_id,
        User.status != 'deleted'  # Chỉ xóa user chưa bị xóa
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or already deleted"
        )
    
    # Kiểm tra không xóa chính mình
    # Nếu current_user là staff và user là user thường, kiểm tra qua email
    if current_user.get("type") == "staff":
        # Staff không thể xóa chính mình (so sánh qua email)
        if user.email == current_user["email"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Staff cannot delete their own user account"
            )
    else:
        # User không thể xóa chính mình
        if user.id == current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete yourself"
            )
    
    # Xóa mềm: chỉ đổi status thành 'deleted'
    user.status = 'deleted'
    
    # Nếu có trường deleted_at thì cập nhật
    if hasattr(user, 'deleted_at'):
        user.deleted_at = datetime.now()
    
    db.commit()
    
    return  # 204 No Content

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db)
):
    """
    Hiển thị danh sách user: id, họ tên, email, ngày tham gia
    """
    try:
        # Cách 1: Query đơn giản hơn
        users = db.query(User).filter(
            User.status != 'deleted'  # Không hiện user đã xóa
        ).all()
        
        result = []
        for user in users:
            result.append({
                "id": user.id,
                "full_name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "joined_date": user.created_at.date() if user.created_at else datetime.now().date()
            })
        
        return result
        
    except Exception as e:
        # Log lỗi để debug
        print(f"Error in get_all_users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

# 6. HIỂN THỊ USER THEO ID (Thêm theo yêu cầu)
@router.get("/users/{user_id}", response_model=UserDetailResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Hiển thị chi tiết user theo ID
    """
    user = db.query(User).filter(
        User.id == user_id,
        User.status != 'deleted'
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Format response
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": f"{user.first_name} {user.last_name}",
        "email": user.email,
        "phone": user.phone,
        "address": user.address,
        "date_of_birth": user.date_of_birth,
        "gender": user.gender,
        "status": user.status,
        "joined_date": user.created_at.date() if user.created_at else None,
        "last_login": user.last_login
    }
@router.get("/admins/super", response_model=List[AdminResponse])
def get_super_admins(
    db: Session = Depends(get_db)
):
    super_admins = db.query(Staff).filter(
        Staff.status != 'deleted',
        Staff.role == 'Super Admin'
    ).all()
    
    return super_admins
@router.get("/admins/{admin_id}", response_model=AdminResponse)
def get_admin_by_id(
    admin_id: int,
    db: Session = Depends(get_db)
):
    """
    Lấy thông tin admin theo ID
    KHÔNG hiển thị admin có status = 'deleted'
    """
    admin = db.query(Staff).filter(
        Staff.admin_id == admin_id,
        Staff.role.ilike('%admin%'),  # Tìm admin (không phải super admin)
        Staff.status != 'deleted'
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    return admin


@router.get("/admins/super/{admin_id}", response_model=AdminResponse)
def get_super_admin_by_id(
    admin_id: int,
    db: Session = Depends(get_db)
):
    """
    Lấy thông tin super admin theo ID
    KHÔNG hiển thị super admin có status = 'deleted'
    """
    super_admin = db.query(Staff).filter(
        Staff.admin_id == admin_id,
        Staff.role.ilike('%super%'),  # Chỉ tìm super admin
        Staff.status != 'deleted'
    ).first()
    
    if not super_admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Super admin not found"
        )
    
    return super_admin

# 3. HIỂN THỊ ADMIN (không hiện status deleted)
@router.get("/admins", response_model=List[AdminResponse])
def get_all_admins(
    db: Session = Depends(get_db)
):
    admins = db.query(Staff).filter(
        Staff.status != 'deleted',  # Không hiện đã xóa
        Staff.role == 'Admin'  # Chỉ hiện Admin, không hiện Super Admin
    ).all()
    
    return admins

# 4. HIỂN THỊ SUPER ADMIN


# 5. THÊM ADMIN MỚI (CHỈ SUPER ADMIN)
@router.post("/admins", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
def create_admin(
    admin_data: AdminCreate,
    current_user: dict = Depends(get_current_super_admin),  # CHỈ super admin
    db: Session = Depends(get_db)
):
    # Kiểm tra email đã tồn tại
    existing = db.query(Staff).filter(Staff.email == admin_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    # Tạo admin mới với role mặc định là 'Admin' (không phải Super Admin)
    new_admin = Staff(
        admin_name=admin_data.admin_name,
        email=admin_data.email,
        password=admin_data.password,
        full_name=admin_data.full_name,
        role='Admin',  # Mặc định là Admin, Super Admin phải tạo riêng
        is_active=True,
        status='work'
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    return new_admin