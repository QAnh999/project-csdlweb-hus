from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .. import models, schemas
from ..database import get_db

# --- QUAN TRỌNG: DÒNG NÀY ĐANG BỊ THIẾU Ở CODE CỦA BẠN ---
router = APIRouter(prefix="/service", tags=["Service"])
# ---------------------------------------------------------

@router.get("/")
async def list_services(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Service))
    return result.scalars().all()

@router.post("/")
async def add_service(s: schemas.ServiceBase, db: AsyncSession = Depends(get_db)):
    new_srv = models.Service(**s.dict())
    db.add(new_srv)
    await db.commit()
    return {"status": "created"}

@router.put("/{sid}")
async def update_service(sid: int, s: schemas.ServiceBase, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Service).where(models.Service.id == sid))
    srv = result.scalars().first()
    if not srv: raise HTTPException(404)
    
    srv.name = s.name
    srv.description = s.description
    srv.base_price = s.base_price
    await db.commit()
    return {"status": "updated"}

@router.delete("/{sid}")
async def delete_service(sid: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Service).where(models.Service.id == sid))
    srv = result.scalars().first()
    if srv:
        await db.delete(srv)
        await db.commit()
    return {"status": "deleted"}