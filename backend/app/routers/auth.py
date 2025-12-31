from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["Auth"])

@router.post("/login")
async def login(data: schemas.LoginRequest, db: AsyncSession = Depends(get_db)):
    # Query Async: select(Model).where(...)
    
    # 1. Check User
    result_user = await db.execute(select(models.User).where(models.User.email == data.email))
    user = result_user.scalars().first()
    
    if user and user.password == data.password:
        return {"token": "user_jwt_mock", "role": "user", "id": user.id, "name": user.first_name}

    # 2. Check Staff
    result_staff = await db.execute(select(models.Staff).where(models.Staff.email == data.email))
    staff = result_staff.scalars().first()
    
    if staff and staff.password == data.password:
        return {"token": "staff_jwt_mock", "role": staff.role, "id": staff.admin_id}

    raise HTTPException(status_code=400, detail="Thông tin đăng nhập không đúng")