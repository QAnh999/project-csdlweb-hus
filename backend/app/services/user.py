from datetime import datetime
from sqlalchemy.orm import Session
from app.repositories.user import user_repository
from app.core.security import hash_password, verify_password
from app.utils.validators import is_valid_email, is_valid_phone, is_strong_password
from app.models.user import User

class UserService:
    def __init__(self, repository = user_repository):
        self.repository = repository

    def create_user(self, db: Session, user_in) -> User:
        if user_in.email and not is_valid_email(user_in.email):
            raise ValueError("Invalid email!")
        if user_in.email and self.repository.get_by_email(db, user_in.email):
            raise ValueError("Email already exists! Please try another email.")
        if user_in.phone and not is_valid_phone(user_in.phone):
            raise ValueError("Invalid phone number!")
        if user_in.phone and self.repository.get_by_phone(db, user_in.phone):
            raise ValueError("Phone number already exists! Please try another phone number.")
        
        hashed_password = hash_password(user_in.password)
        user_data = user_in.model_dump()
        user_data["password"] = hashed_password
        user_data["created_at"] = datetime.utcnow()
        return self.repository.create(db, user_data)
    
    
    def update_user(self, db: Session, user_id: int, user_in) -> User:
        user = self.repository.get(db, user_id)
        if not user:
            raise ValueError("User does not exist!")
    
        update_data = user_in.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        return self.repository.update(db, user, update_data)
    
    def change_password(self, db: Session, user_id: int, current_password: str, new_password: str) -> User:
        user = self.repository.get(db, user_id)
        if not user:
            raise ValueError("User does not exist")
        if not verify_password(current_password, user.password):
            raise ValueError("Current password is incorrect! Please try again.")
        if not is_strong_password(new_password):
            raise ValueError("New password is not strong enough")
        hashed_password = hash_password(new_password)
        return self.repository.update(db, user, {"password": hashed_password, "updated_at": datetime.utcnow()})
    
    def set_last_login(self, db: Session, user: User) -> User:
        return self.repository.update(db, user, {"last_login": datetime.utcnow()})
