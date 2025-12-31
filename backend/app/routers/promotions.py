from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/promotion", tags=["Promotion"])

@router.get("/")
async def list_promotions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Promotion))
    promos = result.scalars().all()
    now = datetime.now()
    
    return [{
        "name": p.name,
        "code": p.code,
        "desc": p.description,
        "start": p.start_date,
        "status": "Active" if (p.start_date <= now <= p.end_date and p.is_active) else "Inactive"
    } for p in promos]

@router.post("/")
async def add_promotion(p: schemas.PromotionCreate, db: AsyncSession = Depends(get_db)):
    new_promo = models.Promotion(**p.dict(), is_active=True)
    db.add(new_promo)
    await db.commit()
    return {"status": "created"}

@router.delete("/{pid}")
async def delete_promotion(pid: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Promotion).where(models.Promotion.id == pid))
    promo = result.scalars().first()
    if promo:
        await db.delete(promo)
        await db.commit()
    return {"status": "deleted"}