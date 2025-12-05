from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.staff import Staff
from app.schemas.staff import StaffCreate, StaffUpdate

class StaffRepository(BaseRepository[Staff, StaffCreate, StaffUpdate]):

    def __init__(self):
        super().__init__(Staff)

    def get_by_email(self, db: Session, email: str):
        return db.query(Staff).filter(Staff.email == email).first()


staff_repository = StaffRepository()
