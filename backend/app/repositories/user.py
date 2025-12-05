from sqlalchemy.orm import Session
from typing import Optional
from app.repositories.base import BaseRepository
from app.models.user import User
from app.schemas.users import UserCreate, UserUpdate


class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):

    def __init__(self):
        super().__init__(User)

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()
    
    def get_by_phone(self, db: Session, phone: str) -> Optional[User]:
        return db.query(User).filter(User.phone == phone).first()
    
    
user_repository = UserRepository()