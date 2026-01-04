from sqlalchemy.orm import Session
from typing import List
from models import Service
from repositories.base import BaseRepository
from schemas.service import ServiceCreate, ServiceUpdate

class ServiceRepository(BaseRepository[Service, ServiceCreate, ServiceUpdate]):
    def __init__(self):
        super().__init__(Service)

    def get_by_category(self, db: Session, category: str) -> List[Service]:
        return db.query(Service).filter(Service.category == category).all()
    
    def list(self, db: Session) -> List[Service]:
        return db.query(Service).filter(Service.is_available == True).all()
service_repository = ServiceRepository()