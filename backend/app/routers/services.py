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
    """
    Lấy danh sách tất cả dịch vụ (chỉ trả về 4 trường)
    """
    try:
        # Chỉ lấy các dịch vụ còn tồn tại trong database
        services = db.query(Service).filter(
            Service.is_available == True  # CHỈ lấy dịch vụ available
        ).order_by(Service.name).all()
        
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
    """
    Lấy thông tin chi tiết 1 dịch vụ
    """
    try:
        service = db.query(Service).filter(
            Service.id == service_id,
            Service.is_available == True  # CHỈ lấy dịch vụ available
        ).first()
        
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
    """
    Tạo dịch vụ mới
    """
    try:
        # Kiểm tra tên dịch vụ đã tồn tại chưa
        existing_service = db.query(Service).filter(
            Service.name == service_data.name,
            Service.is_available == True
        ).first()
        
        if existing_service:
            raise HTTPException(status_code=400, detail="Service name already exists")
        
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
        # QUAN TRỌNG: Phải refresh để lấy ID và các thông tin khác
        db.refresh(db_service)
        
        # Trả về chỉ 4 trường
        return {
            "name": db_service.name,
            "description": db_service.description,
            "category": db_service.category,
            "base_price": db_service.base_price
        }
    except HTTPException:
        raise
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
    """
    Cập nhật dịch vụ - SỬA DỊCH VỤ HIỆN TẠI, KHÔNG TẠO MỚI
    """
    try:
        # Tìm dịch vụ cần sửa
        service = db.query(Service).filter(
            Service.id == service_id,
            Service.is_available == True  # CHỈ sửa dịch vụ available
        ).first()
        
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        
        # Kiểm tra tên mới có trùng với dịch vụ khác không (nếu có cập nhật name)
        if service_data.name and service_data.name != service.name:
            existing_service = db.query(Service).filter(
                Service.name == service_data.name,
                Service.id != service_id,
                Service.is_available == True
            ).first()
            
            if existing_service:
                raise HTTPException(status_code=400, detail="Service name already exists")
        
        # Cập nhật chỉ các trường được cung cấp
        update_data = service_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(service, field, value)
        
        db.commit()
        # QUAN TRỌNG: Phải refresh sau khi commit
        db.refresh(service)
        
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
    """
    Xóa dịch vụ - THỰC CHẤT LÀ SET is_available = False (soft delete)
    """
    try:
        # 1. Kiểm tra service có tồn tại không
        service = db.query(Service).filter(
            Service.id == service_id,
            Service.is_available == True  # CHỈ xóa dịch vụ đang available
        ).first()
        
        if not service:
            raise HTTPException(status_code=404, detail="Service not found or already deleted")
        
        # 2. Kiểm tra xem service có đang được sử dụng trong reservation_services không
        reservation_services = db.query(ReservationService).filter(
            ReservationService.service_id == service_id
        ).first()
        
        if reservation_services:
            # KHÔNG XÓA HẲN, chỉ set is_available = False
            service.is_available = False
            db.commit()
            return {"message": "Service marked as unavailable (still referenced in reservations)"}
        
        # 3. Nếu không có reference, có thể xóa hẳn
        db.delete(service)
        db.commit()
        
        return {"message": "Service deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting service: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/all/with-id")
def get_all_services_with_id(db: Session = Depends(get_db)):
    """
    API phụ để kiểm tra tất cả dịch vụ (cả deleted) - chỉ dùng cho debug
    """
    try:
        services = db.query(Service).order_by(Service.id).all()
        
        result = []
        for service in services:
            result.append({
                "id": service.id,
                "name": service.name,
                "description": service.description,
                "category": service.category,
                "base_price": float(service.base_price) if service.base_price else 0,
                "is_available": service.is_available
            })
        
        return result
    except Exception as e:
        print(f"Error getting all services: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")