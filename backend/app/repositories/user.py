from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.repositories.base import BaseRepository
from app.models.user import User, UserStatus
from app.schemas.user import UserCreate, UserUpdate


class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):

    def __init__(self):
        super().__init__(User)

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()
    
    def get_by_phone(self, db: Session, phone: str) -> Optional[User]:
        return db.query(User).filter(User.phone == phone).first()
    
    def delete_user(self, db: Session, user_id: int) -> User:
        user = db.query(User).filter(
            User.id == user_id,
            User.status != UserStatus.DELETED
        ).first()

        if not user:
            raise ValueError("User not found")
        
        user.status = UserStatus.DELETED
        user.deleted_at = datetime.utcnow()

        db.commit()
        db.refresh(user)
        return user
    
    
user_repository = UserRepository()