from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.get("/")
def list_feedbacks(db: Session = Depends(get_db)):
    fb = db.query(models.Review).all()
    res = []
    for f in fb:
        res.append({
            "id": f.id,
            "user_name": f"{f.user.last_name} {f.user.first_name}" if f.user else "Anonymous",
            "rating_overall": f.rating_overall,
            "comment_text": f.comment_text,
            "date": f.created_at.strftime("%d/%m/%Y")
        })
    return res

@router.delete("/{id}")
def delete_feedback(id: int, db: Session = Depends(get_db)):
    # Xóa luôn khỏi DB
    f = db.query(models.Review).filter(models.Review.id == id).first()
    if not f: raise HTTPException(404)
    db.delete(f)
    db.commit()
    return {"status": "success"}