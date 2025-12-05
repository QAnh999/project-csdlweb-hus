from sqlalchemy.orm import Session
from typing import List
from app.models.service import Service
from app.repositories.base import BaseRepository
from app.schemas.services import ServiceCreate, ServiceUpdate

class ServiceRepository(BaseRepository[Service, ServiceCreate, ServiceUpdate]):
    def __init__(self):
        super().__init__(Service)

    def get_by_category(self, db: Session, category: str) -> List[Service]:
        return db.query(Service).filter(Service.category == category).all()
    
service_repository = ServiceRepository()