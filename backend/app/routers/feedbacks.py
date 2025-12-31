from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from .. import models
from ..database import get_db

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.get("/")
async def list_feedbacks(db: AsyncSession = Depends(get_db)):
    # Eager load user
    stmt = select(models.Review).options(selectinload(models.Review.user))
    result = await db.execute(stmt)
    reviews = result.scalars().all()
    
    return [{
        "user_name": r.user.first_name if r.user else "Anonymous",
        "rating": r.rating_overall,
        "comment": r.comment_text,
        "id": r.id
    } for r in reviews]

@router.delete("/{fid}")
async def delete_feedback(fid: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Review).where(models.Review.id == fid))
    review = result.scalars().first()
    if review:
        await db.delete(review)
        await db.commit()
    return {"status": "deleted"}