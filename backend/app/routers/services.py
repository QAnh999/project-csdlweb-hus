from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import Service, ReservationService
import schemas
from typing import List

router = APIRouter(prefix="/services", tags=["Services"])

@router.get("/", response_model=List[schemas.ServiceResponse])
def get_services(db: Session = Depends(get_db)):
    try:
        services = db.query(Service).order_by(Service.name).all()
        
        # Chỉ trả về 4 trường, không cần id và is_available
        response = []
        for service in services:
            response.append({
                "name": service.name,
                "description": service.description,
                "category": service.category,
                "base_price": service.base_price
            })
        
        return response
    except Exception as e:
        print(f"Error getting services: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{service_id}")
def get_service(service_id: int, db: Session = Depends(get_db)):
    try:
        service = db.query(Service).filter(Service.id == service_id).first()
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        
        # Chỉ trả về 4 trường
        return {
            "name": service.name,
            "description": service.description,
            "category": service.category,
            "base_price": service.base_price
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting service: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/")
def create_service(service_data: schemas.ServiceCreate, db: Session = Depends(get_db)):
    try:
        # Tạo service mới với is_available = True mặc định
        db_service = Service(
            name=service_data.name,
            description=service_data.description,
            category=service_data.category,
            base_price=service_data.base_price,
            is_available=True  # Mặc định là true
        )
        
        db.add(db_service)
        db.commit()
        db.refresh(db_service)
        
        # Trả về chỉ 4 trường
        return {
            "name": db_service.name,
            "description": db_service.description,
            "category": db_service.category,
            "base_price": db_service.base_price
        }
    except Exception as e:
        print(f"Error creating service: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{service_id}")
def update_service(
    service_id: int, 
    service_data: schemas.ServiceUpdate, 
    db: Session = Depends(get_db)
):
    try:
        service = db.query(Service).filter(Service.id == service_id).first()
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        
        # Cập nhật chỉ các trường được cung cấp
        update_data = service_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(service, field, value)
        
        db.commit()
        
        # Trả về chỉ 4 trường
        return {
            "name": service.name,
            "description": service.description,
            "category": service.category,
            "base_price": service.base_price
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating service: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db)):
    try:
        # 1. Kiểm tra service có tồn tại không
        service = db.query(Service).filter(Service.id == service_id).first()
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        
        # 2. Kiểm tra xem service có đang được sử dụng trong reservation_services không
        reservation_services = db.query(ReservationService).filter(
            ReservationService.service_id == service_id
        ).first()
        
        if reservation_services:
            # Nếu có, xóa tất cả reservation_services liên quan trước
            db.query(ReservationService).filter(
                ReservationService.service_id == service_id
            ).delete()
        
        # 3. Xóa service
        db.delete(service)
        db.commit()
        
        return {"message": "Service deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting service: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")