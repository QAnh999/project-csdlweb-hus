from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Review, User
import schemas.admin_schemas as schemas
from typing import List

router = APIRouter(prefix="/admin/feedbacks", tags=["Feedbacks"])

@router.get("/", response_model=List[schemas.FeedbackResponse])
def get_feedbacks(db: Session = Depends(get_db)):
    feedbacks = db.query(
        Review.id,  # THÊM ID
        User.first_name,
        User.last_name,
        Review.rating_overall,
        Review.comment_text,
        Review.comment_date
    ).join(Review, Review.user_id == User.id
    ).order_by(Review.comment_date.desc()).all()
    
    return [
        {
            "id": feedback.id,  # THÊM ID
            "user_name": f"{feedback.first_name} {feedback.last_name}",
            "rating_overall": feedback.rating_overall,
            "comment_text": feedback.comment_text,
            "comment_date": feedback.comment_date.date()
        }
        for feedback in feedbacks
    ]

@router.delete("/{feedback_id}")
def delete_feedback(feedback_id: int, db: Session = Depends(get_db)):
    feedback = db.query(Review).filter(Review.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    db.delete(feedback)
    db.commit()
    
    return {"message": "Feedback deleted successfully"}