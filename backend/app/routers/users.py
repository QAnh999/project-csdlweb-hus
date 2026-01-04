from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from .. import models, database
import schemas.admin_schemas as schemas
from ..routers import auth

router = APIRouter(prefix="/users", tags=["Users"])

# API lấy danh sách user (Chỉ Admin/Super Admin)
@router.get("/", response_model=List[schemas.UserResponse], dependencies=[Depends(auth.check_role(["Admin", "Super Admin"]))])
async def get_users(db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.User))
    return result.scalars().all()

# API thêm user (Chỉ Super Admin)
@router.post("/", dependencies=[Depends(auth.check_role(["Super Admin"]))])
async def create_user(user: schemas.UserCreate, db: AsyncSession = Depends(database.get_db)):
    # Hash password trước khi lưu
    hashed_pw = auth.get_password_hash(user.password)
    new_user = models.User(**user.dict(exclude={"password"}), password=hashed_pw)
    db.add(new_user)
    try:
        await db.commit()
    except Exception:
        raise HTTPException(status_code=400, detail="Email đã tồn tại")
    return {"message": "User created successfully"}

@router.delete("/{id}", dependencies=[Depends(auth.check_role(["Super Admin"]))])
async def delete_user(id: int, db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.User).where(models.User.id == id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.delete(user)
    await db.commit()
    return {"message": "Deleted"}