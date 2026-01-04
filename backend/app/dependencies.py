"""
File dependencies.py - Chứa tất cả các dependency cho xác thực và phân quyền
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import logging

from database import get_db
from models import User, Staff

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security scheme cho Bearer token
security = HTTPBearer(auto_error=False)

# ==================== CONSTANTS ====================

# Role constants
ROLE_SUPER_ADMIN = "super_admin"
ROLE_ADMIN = "admin"
ROLE_USER = "user"
ROLE_STAFF = "staff"

# Permission constants
PERMISSION_MANAGE_ADMINS = "manage_admins"
PERMISSION_MANAGE_USERS = "manage_users"
PERMISSION_MANAGE_FLIGHTS = "manage_flights"
PERMISSION_MANAGE_BOOKINGS = "manage_bookings"
PERMISSION_MANAGE_SERVICES = "manage_services"
PERMISSION_MANAGE_PROMOTIONS = "manage_promotions"
PERMISSION_MANAGE_FEEDBACK = "manage_feedback"
PERMISSION_VIEW_DASHBOARD = "view_dashboard"
PERMISSION_VIEW_REPORTS = "view_reports"

# ==================== UTILITY FUNCTIONS ====================

def validate_token_format(token: str) -> Dict[str, Any]:
    """
    Validate token format và trả về thông tin từ token
    """
    if not token:
        return None
    
    if token.startswith("staff_token_"):
        try:
            parts = token.split("_")
            if len(parts) != 3:
                raise ValueError("Invalid staff token format")
            
            admin_id = int(parts[2])
            return {
                "type": "staff",
                "id": admin_id,
                "original_token": token
            }
        except (ValueError, IndexError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid staff token format"
            )
    
    elif token.startswith("user_token_"):
        try:
            parts = token.split("_")
            if len(parts) != 3:
                raise ValueError("Invalid user token format")
            
            user_id = int(parts[2])
            return {
                "type": "user",
                "id": user_id,
                "original_token": token
            }
        except (ValueError, IndexError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user token format"
            )
    
    return None

def normalize_role(role: str) -> str:
    """
    Chuẩn hóa role về dạng lowercase với underscore
    """
    if not role:
        return ""
    
    # Chuyển về lowercase và thay thế khoảng trắng bằng underscore
    normalized = role.lower().strip().replace(" ", "_")
    
    # Xử lý các cách viết khác nhau của super admin
    if normalized in ["superadmin", "super_admin", "super_administrator"]:
        return ROLE_SUPER_ADMIN
    
    return normalized

# ==================== CORE DEPENDENCIES ====================

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Dependency cốt lõi để lấy thông tin user từ token
    """
    # Kiểm tra xem có token không
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    logger.info(f"Attempting authentication with token: {token[:20]}...")
    
    # Validate token format
    token_info = validate_token_format(token)
    if not token_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format. Token must start with 'staff_token_' or 'user_token_'",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_type = token_info["type"]
    user_id = token_info["id"]
    
    try:
        if user_type == "staff":
            # Tìm staff trong database
            staff = db.query(Staff).filter(
                Staff.admin_id == user_id,
                Staff.is_active == True,
                # Không lấy những staff đã bị xóa (nếu có trường status)
                # Staff.status != 'deleted'
            ).first()
            
            if not staff:
                logger.warning(f"Staff not found or inactive: ID={user_id}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Staff account not found or inactive",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Chuẩn hóa role
            normalized_role = normalize_role(staff.role)
            
            # Build user info
            user_info = {
                "id": staff.admin_id,
                "email": staff.email,
                "name": staff.full_name,
                "role": normalized_role,
                "type": "staff",
                "original_role": staff.role,
                "is_active": staff.is_active,
                "avatar": staff.avatar
            }
            
            logger.info(f"Staff authenticated: {staff.email} ({normalized_role})")
            return user_info
        
        elif user_type == "user":
            # Tìm user trong database
            user = db.query(User).filter(
                User.id == user_id,
                User.status == 'active'  # Chỉ lấy user active
            ).first()
            
            if not user:
                logger.warning(f"User not found or inactive: ID={user_id}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User account not found or inactive",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Build user info
            user_info = {
                "id": user.id,
                "email": user.email,
                "name": f"{user.first_name} {user.last_name}",
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": ROLE_USER,
                "type": "user",
                "status": user.status,
                "phone": user.phone,
                "address": user.address,
                "date_of_birth": user.date_of_birth,
                "gender": user.gender,
                "created_at": user.created_at
            }
            
            logger.info(f"User authenticated: {user.email}")
            return user_info
        
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user type",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during authentication"
        )

# ==================== ROLE-BASED DEPENDENCIES ====================

def get_current_staff(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Dependency chỉ cho phép staff (bao gồm cả admin và super admin)
    """
    if current_user["type"] != "staff":
        logger.warning(f"Non-staff user attempted to access staff-only endpoint: {current_user['email']}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff privileges required"
        )
    
    return current_user

def get_current_admin(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Dependency cho admin (bao gồm cả super admin)
    Staff có role 'admin' hoặc 'super_admin' đều được
    """
    if current_user["type"] != "staff":
        logger.warning(f"Non-staff user attempted to access admin endpoint: {current_user['email']}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    if current_user["role"] not in [ROLE_ADMIN, ROLE_SUPER_ADMIN]:
        logger.warning(f"Staff without admin role attempted to access admin endpoint: {current_user['email']} ({current_user['role']})")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    return current_user

def get_current_super_admin(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Dependency chỉ cho phép super admin
    """
    if current_user["type"] != "staff":
        logger.warning(f"Non-staff user attempted to access super admin endpoint: {current_user['email']}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin privileges required"
        )
    
    if current_user["role"] != ROLE_SUPER_ADMIN:
        logger.warning(f"Non-super admin staff attempted to access super admin endpoint: {current_user['email']} ({current_user['role']})")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin privileges required"
        )
    
    return current_user

def get_current_active_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Dependency cho user đang active (cả staff và regular user)
    """
    if current_user.get("status") not in [None, 'active'] and current_user.get("is_active") not in [None, True]:
        logger.warning(f"Inactive user attempted to access endpoint: {current_user['email']}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is not active"
        )
    
    return current_user

# ==================== PERMISSION-BASED DEPENDENCIES ====================

def require_permission(required_permission: str):
    """
    Factory function tạo dependency cho permission cụ thể
    """
    def permission_dependency(current_user: Dict[str, Any] = Depends(get_current_user)):
        # Định nghĩa permission mapping
        permission_mapping = {
            PERMISSION_MANAGE_ADMINS: [ROLE_SUPER_ADMIN],
            PERMISSION_MANAGE_USERS: [ROLE_SUPER_ADMIN, ROLE_ADMIN],
            PERMISSION_MANAGE_FLIGHTS: [ROLE_SUPER_ADMIN, ROLE_ADMIN],
            PERMISSION_MANAGE_BOOKINGS: [ROLE_SUPER_ADMIN, ROLE_ADMIN],
            PERMISSION_MANAGE_SERVICES: [ROLE_SUPER_ADMIN, ROLE_ADMIN],
            PERMISSION_MANAGE_PROMOTIONS: [ROLE_SUPER_ADMIN, ROLE_ADMIN],
            PERMISSION_MANAGE_FEEDBACK: [ROLE_SUPER_ADMIN, ROLE_ADMIN],
            PERMISSION_VIEW_DASHBOARD: [ROLE_SUPER_ADMIN, ROLE_ADMIN],
            PERMISSION_VIEW_REPORTS: [ROLE_SUPER_ADMIN, ROLE_ADMIN, ROLE_STAFF],
        }
        
        # Kiểm tra permission có tồn tại không
        if required_permission not in permission_mapping:
            logger.error(f"Undefined permission: {required_permission}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error: undefined permission"
            )
        
        # Lấy role được phép
        allowed_roles = permission_mapping[required_permission]
        user_role = current_user.get("role")
        
        # Staff mặc định có một số permission
        if current_user["type"] == "staff" and required_permission in [
            PERMISSION_VIEW_DASHBOARD, PERMISSION_VIEW_REPORTS
        ]:
            return current_user
        
        # Kiểm tra quyền
        if user_role not in allowed_roles:
            logger.warning(f"User {current_user['email']} with role {user_role} attempted to access endpoint requiring {required_permission}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{required_permission}' required"
            )
        
        return current_user
    
    return permission_dependency

# ==================== SPECIFIC USE CASE DEPENDENCIES ====================

def get_own_user_or_admin(
    user_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Dependency cho phép user truy cập thông tin của chính họ hoặc admin truy cập thông tin user khác
    """
    # Admin/Super Admin có thể truy cập thông tin của bất kỳ user nào
    if current_user["type"] == "staff" and current_user["role"] in [ROLE_ADMIN, ROLE_SUPER_ADMIN]:
        return current_user
    
    # Regular user chỉ có thể truy cập thông tin của chính họ
    if current_user["id"] != user_id:
        logger.warning(f"User {current_user['email']} attempted to access another user's data (ID: {user_id})")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own data"
        )
    
    return current_user

def get_flight_management_access(
    flight_id: Optional[int] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Dependency cho quản lý chuyến bay
    - Super Admin: toàn quyền
    - Admin: toàn quyền
    - Staff khác: chỉ xem
    - User: không có quyền
    """
    if current_user["type"] != "staff":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Flight management requires staff privileges"
        )
    
    if current_user["role"] not in [ROLE_SUPER_ADMIN, ROLE_ADMIN]:
        # Staff không phải admin chỉ có thể xem
        return {**current_user, "can_edit": False, "can_delete": False}
    
    return {**current_user, "can_edit": True, "can_delete": True}

# ==================== QUICK ACCESS DEPENDENCIES ====================

# Dependencies nhanh cho các trường hợp phổ biến
require_super_admin = get_current_super_admin
require_admin = get_current_admin
require_staff = get_current_staff
require_active_user = get_current_active_user

# Permission shortcuts
require_manage_admins = require_permission(PERMISSION_MANAGE_ADMINS)
require_manage_users = require_permission(PERMISSION_MANAGE_USERS)
require_manage_flights = require_permission(PERMISSION_MANAGE_FLIGHTS)
require_manage_bookings = require_permission(PERMISSION_MANAGE_BOOKINGS)
require_view_dashboard = require_permission(PERMISSION_VIEW_DASHBOARD)

# ==================== HELPER FUNCTIONS ====================

def check_user_permission(user: Dict[str, Any], required_role: str) -> bool:
    """
    Helper function để check quyền của user
    """
    return user.get("role") == required_role

def get_user_id_from_token(token: str) -> Optional[int]:
    """
    Helper function để lấy user ID từ token (không cần database)
    """
    try:
        if token.startswith("staff_token_"):
            return int(token.split("_")[-1])
        elif token.startswith("user_token_"):
            return int(token.split("_")[-1])
    except (ValueError, IndexError):
        return None
    
    return None

def has_permission(user: Dict[str, Any], permission: str) -> bool:
    """
    Helper function để check nếu user có permission
    """
    permission_roles = {
        PERMISSION_MANAGE_ADMINS: [ROLE_SUPER_ADMIN],
        PERMISSION_MANAGE_USERS: [ROLE_SUPER_ADMIN, ROLE_ADMIN],
        PERMISSION_MANAGE_FLIGHTS: [ROLE_SUPER_ADMIN, ROLE_ADMIN],
        PERMISSION_VIEW_DASHBOARD: [ROLE_SUPER_ADMIN, ROLE_ADMIN],
    }
    
    if permission not in permission_roles:
        return False
    
    return user.get("role") in permission_roles[permission]

# ==================== EXPORT ALL DEPENDENCIES ====================

__all__ = [
    # Core dependencies
    "get_current_user",
    "get_current_staff",
    "get_current_admin",
    "get_current_super_admin",
    "get_current_active_user",
    
    # Permission-based
    "require_permission",
    
    # Specific use cases
    "get_own_user_or_admin",
    "get_flight_management_access",
    
    # Quick access
    "require_super_admin",
    "require_admin",
    "require_staff",
    "require_active_user",
    "require_manage_admins",
    "require_manage_users",
    "require_manage_flights",
    "require_manage_bookings",
    "require_view_dashboard",
    
    # Helper functions
    "check_user_permission",
    "get_user_id_from_token",
    "has_permission",
    
    # Constants
    "ROLE_SUPER_ADMIN",
    "ROLE_ADMIN",
    "ROLE_USER",
    "ROLE_STAFF",
    "PERMISSION_MANAGE_ADMINS",
    "PERMISSION_MANAGE_USERS",
    "PERMISSION_MANAGE_FLIGHTS",
    "PERMISSION_MANAGE_BOOKINGS",
    "PERMISSION_MANAGE_SERVICES",
    "PERMISSION_MANAGE_PROMOTIONS",
    "PERMISSION_MANAGE_FEEDBACK",
    "PERMISSION_VIEW_DASHBOARD",
    "PERMISSION_VIEW_REPORTS",
]