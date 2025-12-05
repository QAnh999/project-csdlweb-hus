from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.user import Users
from app.schemas.users import UserCreate, UserUpdate

class UserRepository(BaseRepository[Users, UserCreate, UserUpdate]):

    def __init__(self):
        super().__init__(Users)

    def get_by_email(self, db: Session, email: str):
        return db.query(Users).filter(Users.email == email).first()


user_repository = UserRepository()
