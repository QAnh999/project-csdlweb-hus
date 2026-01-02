from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/managers", tags=["Managers"])

# Hàm check quyền SuperAdmin
def verify_super(role: str = Header(default=None)):
    # Thực tế bạn nên lấy role từ token, nhưng ở đây giả sử truyền header
    # Hoặc logic so sánh đơn giản nếu FE truyền role lên
    pass 

@router.delete("/admin/{id}")
def delete_admin(id: int, db: Session = Depends(get_db)):
    # Superadmin xóa admin -> Chuyển status thành deleted
    # Cần logic check xem người gọi api có phải superadmin không
    # Ở đây làm logic xử lý db:
    admin = db.query(models.Staff).filter(models.Staff.admin_id == id).first()
    if not admin: raise HTTPException(404)
    
    admin.status = "deleted"
    db.commit()
    return {"status": "success"}

@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [{
        "id": u.id,
        "full_name": f"{u.last_name} {u.first_name}",
        "email": u.email,
        "joined_date": u.created_at.strftime("%d/%m/%Y") if u.created_at else ""
    } for u in users]

@router.get("/admins")
def list_admins(db: Session = Depends(get_db)):
    # Không hiển thị người có status là deleted
    admins = db.query(models.Staff)\
        .filter(models.Staff.role == "Admin")\
        .filter(models.Staff.status != 'deleted').all()
        
    return [{"id": a.admin_id, "name": a.full_name, "role": a.role, "email": a.email} for a in admins]

@router.get("/super-admins")
def list_supers(db: Session = Depends(get_db)):
    supers = db.query(models.Staff).filter(models.Staff.role == "Super Admin").all()
    return [{"id": s.admin_id, "name": s.full_name, "email": s.email} for s in supers]

@router.post("/admin")
def add_admin(s: schemas.StaffCreate, db: Session = Depends(get_db)):
    # Thêm admin mới
    exist = db.query(models.Staff).filter(models.Staff.email == s.email).first()
    if exist: raise HTTPException(400, "Email exists")
    
    new_admin = models.Staff(**s.dict())
    new_admin.status = "active"
    db.add(new_admin)
    db.commit()
    return {"status": "success"}