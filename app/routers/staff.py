from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.staff import staff_service

router = APIRouter(prefix="/staff", tags=["Staff"])

@router.post("/login")
def login(admin_name: str, password: str, db: Session = Depends(get_db)):
    return staff_service.login(db, admin_name, password)
