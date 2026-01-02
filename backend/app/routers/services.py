from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/service", tags=["Service"])

@router.get("/")
def list_services(db: Session = Depends(get_db)):
    return db.query(models.Service).all()

@router.post("/")
def add_service(s: schemas.ServiceCreate, db: Session = Depends(get_db)):
    # ID tự tăng, các trường khác người dùng nhập
    new_s = models.Service(**s.dict())
    db.add(new_s)
    db.commit()
    return {"status": "success"}

@router.put("/{id}")
def update_service(id: int, s: schemas.ServiceCreate, db: Session = Depends(get_db)):
    srv = db.query(models.Service).filter(models.Service.id == id).first()
    if not srv: raise HTTPException(404)
    
    srv.name = s.name
    srv.description = s.description
    srv.base_price = s.base_price
    srv.category = s.category
    db.commit()
    return {"status": "success"}

@router.delete("/{id}")
def delete_service(id: int, db: Session = Depends(get_db)):
    srv = db.query(models.Service).filter(models.Service.id == id).first()
    if not srv: raise HTTPException(404)
    db.delete(srv)
    db.commit()
    return {"status": "success"}