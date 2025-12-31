from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .. import models
from ..database import get_db

router = APIRouter(prefix="/managers", tags=["Managers"])

@router.delete("/{admin_id}")
async def delete_admin(admin_id: int, role: str = "Super Admin", db: AsyncSession = Depends(get_db)):
    if role != "Super Admin": raise HTTPException(403, "Không đủ quyền")
    
    result = await db.execute(select(models.Staff).where(models.Staff.admin_id == admin_id))
    target = result.scalars().first()
    
    if not target: raise HTTPException(404, "Admin không tồn tại")
    if target.role == "Super Admin": raise HTTPException(400, "Không thể xóa Super Admin")
    
    await db.delete(target)
    await db.commit()
    return {"status": "deleted"}