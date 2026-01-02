from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, engine
from models import Promotion
import schemas
from typing import List
from datetime import datetime

router = APIRouter(prefix="/promotions", tags=["Promotions"])

def fix_promotion_sequence(db: Session):
    """Fix sequence for promotions table"""
    try:
        # Lấy ID cao nhất hiện tại
        result = db.execute(text("SELECT COALESCE(MAX(id), 0) FROM promotions"))
        max_id = result.scalar()
        
        # Reset sequence
        db.execute(text(f"SELECT setval('promotions_id_seq', {max_id + 1}, false)"))
        db.commit()
        print(f"Promotion sequence fixed to: {max_id + 1}")
    except Exception as e:
        db.rollback()
        print(f"Error fixing promotion sequence: {str(e)}")

@router.get("/", response_model=List[schemas.PromotionResponse])
def get_promotions(db: Session = Depends(get_db)):
    try:
        now = datetime.now()
        
        promotions = db.query(Promotion).order_by(Promotion.start_date.desc()).all()
        
        result = []
        for promo in promotions:
            # Xác định trạng thái dựa trên ngày hiện tại
            status = "active" if promo.start_date <= now <= promo.end_date and promo.is_active else "inactive"
            
            result.append({
                "id": promo.id,
                "code": promo.code,
                "name": promo.name,
                "description": promo.description,
                "start_date": promo.start_date.date() if promo.start_date else None,
                "end_date": promo.end_date.date() if promo.end_date else None,
                "status": status
            })
        
        return result
    except Exception as e:
        print(f"Error getting promotions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/")
def create_promotion(promo_data: schemas.PromotionCreate, db: Session = Depends(get_db)):
    try:
        # Kiểm tra mã giảm giá đã tồn tại chưa
        existing = db.query(Promotion).filter(Promotion.code == promo_data.code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Promotion code already exists")
        
        # Tạo promotion mới với ID tự động
        db_promo = Promotion(
            code=promo_data.code,
            name=promo_data.name,
            description=promo_data.description,
            discount_type=promo_data.discount_type,
            discount_value=promo_data.discount_value,
            min_order_amount=promo_data.min_order_amount,
            max_discount_amount=promo_data.max_discount_amount,
            usage_limit=promo_data.usage_limit,
            start_date=promo_data.start_date,
            end_date=promo_data.end_date,
            is_active=True
        )
        
        db.add(db_promo)
        db.commit()
        
        # Fix sequence sau khi commit thành công
        fix_promotion_sequence(db)
        
        # Refresh để lấy ID
        db.refresh(db_promo)
        
        # Trả về với status
        now = datetime.now()
        status = "active" if db_promo.start_date <= now <= db_promo.end_date and db_promo.is_active else "inactive"
        
        return {
            "id": db_promo.id,
            "code": db_promo.code,
            "name": db_promo.name,
            "description": db_promo.description,
            "start_date": db_promo.start_date.date() if db_promo.start_date else None,
            "end_date": db_promo.end_date.date() if db_promo.end_date else None,
            "status": status
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating promotion: {str(e)}")
        db.rollback()
        # Thử fix sequence khi có lỗi
        try:
            fix_promotion_sequence(db)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")