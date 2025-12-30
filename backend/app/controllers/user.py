from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.services.user import UserService
from app.repositories.user import user_repository
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserPassword

class UserController:
    def __init__(self):
        self.service = UserService(user_repository)

    def get_user(self, user_id: int, db: Session) -> Optional[UserResponse]:
        user = user_repository.get(db, user_id)
        if not user:
            raise HTTPException(404, "User not found")
        return UserResponse.model_validate(user)
    
    # def get_all_users(self, db: Session) -> List[UserResponse]:
    #     users = user_repository.get_all(db)
    #     return [UserResponse.model_validate(u) for u in users]
    
    def create_user(self, data: UserCreate, db: Session) -> UserResponse:
        try:
            user = self.service.create_user(db, data)
            return UserResponse.model_validate(user)
        except ValueError as e:
            raise HTTPException(400, str(e))
        
    def update_user(self, user_id: int, data: UserUpdate, db: Session) -> UserResponse:
        try:
            user = self.service.update_user(db, user_id, data)
            return UserResponse.model_validate(user)
        except ValueError as e:
            raise HTTPException(400, str(e))
        

    def delete_user(self, user_id: int, db: Session) -> dict:
        user = user_repository.get(db, user_id)
        if not user:
            raise HTTPException(404, "User not found")
        user_repository.delete_user(db, user_id)
        return {"message": "User deleted successfully"}
    
    def change_password(self, user_id: int, data: UserPassword, db: Session) -> dict:
        try:
            self.service.change_password(
                db=db,
                user_id=user_id,
                current_password=data.current_password,
                new_password=data.new_password
            )
            return {"message": "Password changed successfully"}
        except ValueError as e:
            raise HTTPException(400, str(e))
        
user_controller = UserController()
