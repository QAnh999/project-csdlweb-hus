from fastapi import Depends, HTTPException, status
from jose import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "SUPER_SECRET_KEY"
ALGORITHM = "HS256"

security = HTTPBearer()

def get_current_staff(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload.get("type") != "Admin":
        raise HTTPException(status_code=403, detail="Chỉ staff mới được truy cập")

    return payload


def require_super_admin(
    staff=Depends(get_current_staff)
):
    if staff.get("role") != "Super Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ Super Admin mới có quyền này"
        )
    return staff
