from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/promotion", tags=["Promotion"])

@router.get("/")
def list_promos(db: Session = Depends(get_db)):
    promos = db.query(models.Promotion).all()
    res = []
    now = datetime.now()
    for p in promos:
        # Kiểm tra trạng thái dựa trên ngày thực tế
        is_active = "active" if p.start_date <= now <= p.end_date else "inactive"
        
        res.append({
            "name": p.name,
            "description": p.description,
            "start_date": p.start_date.strftime("%d/%m/%Y"),
            "end_date": p.end_date.strftime("%d/%m/%Y"),
            "status": is_active
        })
    return res

@router.post("/")
def add_promo(p: schemas.PromotionCreate, db: Session = Depends(get_db)):
    if p.start_date.tzinfo: p.start_date = p.start_date.replace(tzinfo=None)
    if p.end_date.tzinfo: p.end_date = p.end_date.replace(tzinfo=None)
    
    db.add(models.Promotion(**p.dict()))
    db.commit()
    return {"status": "success"}