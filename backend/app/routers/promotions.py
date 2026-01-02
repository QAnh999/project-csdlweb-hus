from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import Promotion
import schemas
from typing import List
from datetime import datetime

router = APIRouter(prefix="/promotions", tags=["Promotions"])

def fix_promotion_sequence_now(db: Session):
    """Fix sequence cho promotions table ngay lập tức"""
    try:
        # Lấy ID cao nhất hiện tại từ bảng
        result = db.execute(text("SELECT COALESCE(MAX(id), 0) FROM promotions"))
        max_id = result.scalar()
        
        # Lấy giá trị sequence hiện tại
        result = db.execute(text("SELECT last_value FROM promotions_id_seq"))
        current_seq = result.scalar()
        
        print(f"Current max id: {max_id}, Current sequence: {current_seq}")
        
        # Nếu sequence nhỏ hơn max_id, reset nó
        if current_seq <= max_id:
            new_seq = max_id + 1
            db.execute(text(f"SELECT setval('promotions_id_seq', {new_seq}, true)"))
            db.commit()
            print(f"Promotion sequence reset to: {new_seq}")
            return True
        return False
    except Exception as e:
        print(f"Error in fix_promotion_sequence_now: {str(e)}")
        db.rollback()
        return False

@router.get("/", response_model=List[schemas.PromotionResponse])
def get_promotions(db: Session = Depends(get_db)):
    try:
        now = datetime.now()
        
        promotions = db.query(Promotion).order_by(Promotion.start_date.desc()).all()
        
        result = []
        for promo in promotions:
            # Xác định trạng thái dựa trên ngày hiện tại
            is_active_time = promo.start_date and promo.end_date and promo.start_date <= now <= promo.end_date
            status = "active" if is_active_time and promo.is_active else "inactive"
            
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
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # Kiểm tra mã giảm giá đã tồn tại chưa
            existing = db.query(Promotion).filter(Promotion.code == promo_data.code).first()
            if existing:
                raise HTTPException(status_code=400, detail="Promotion code already exists")
            
            # Fix sequence trước khi insert
            fix_promotion_sequence_now(db)
            
            # Tạo promotion mới
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
            db.refresh(db_promo)
            
            # Trả về với status
            now = datetime.now()
            is_active_time = db_promo.start_date and db_promo.end_date and db_promo.start_date <= now <= db_promo.end_date
            status = "active" if is_active_time and db_promo.is_active else "inactive"
            
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
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            db.rollback()
            
            # Fix sequence và thử lại
            fix_promotion_sequence_now(db)
            
            if attempt == max_retries - 1:
                # Thử cách khác: insert với ID tự tính
                try:
                    return create_promotion_with_custom_id(promo_data, db)
                except Exception as e2:
                    print(f"Alternative method also failed: {str(e2)}")
                    raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
    raise HTTPException(status_code=500, detail="Failed to create promotion after multiple attempts")

def create_promotion_with_custom_id(promo_data: schemas.PromotionCreate, db: Session):
    """Tạo promotion với ID tự tính (fallback method)"""
    try:
        # Lấy ID cao nhất hiện tại
        result = db.execute(text("SELECT COALESCE(MAX(id), 0) FROM promotions"))
        max_id = result.scalar()
        new_id = max_id + 1
        
        # Insert trực tiếp với SQL
        sql = """
        INSERT INTO promotions (id, code, name, description, discount_type, discount_value, 
                               min_order_amount, max_discount_amount, usage_limit, 
                               start_date, end_date, is_active)
        VALUES (:id, :code, :name, :description, :discount_type, :discount_value,
                :min_order_amount, :max_discount_amount, :usage_limit,
                :start_date, :end_date, :is_active)
        RETURNING id
        """
        
        params = {
            'id': new_id,
            'code': promo_data.code,
            'name': promo_data.name,
            'description': promo_data.description,
            'discount_type': promo_data.discount_type,
            'discount_value': float(promo_data.discount_value),
            'min_order_amount': float(promo_data.min_order_amount) if promo_data.min_order_amount else 0,
            'max_discount_amount': float(promo_data.max_discount_amount) if promo_data.max_discount_amount else None,
            'usage_limit': promo_data.usage_limit,
            'start_date': promo_data.start_date,
            'end_date': promo_data.end_date,
            'is_active': True
        }
        
        result = db.execute(text(sql), params)
        db.commit()
        
        # Cập nhật sequence
        db.execute(text(f"SELECT setval('promotions_id_seq', {new_id + 1}, true)"))
        db.commit()
        
        # Lấy promotion vừa tạo
        promo = db.query(Promotion).filter(Promotion.id == new_id).first()
        
        # Trả về response
        now = datetime.now()
        is_active_time = promo.start_date and promo.end_date and promo.start_date <= now <= promo.end_date
        status = "active" if is_active_time and promo.is_active else "inactive"
        
        return {
            "id": promo.id,
            "code": promo.code,
            "name": promo.name,
            "description": promo.description,
            "start_date": promo.start_date.date() if promo.start_date else None,
            "end_date": promo.end_date.date() if promo.end_date else None,
            "status": status
        }
        
    except Exception as e:
        db.rollback()
        raise Exception(f"Fallback method failed: {str(e)}")