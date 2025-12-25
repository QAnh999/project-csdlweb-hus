from sqlalchemy.orm import Session 
from app.repositories.user import user_repository
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.utils.validators import detect_identifier
from app.services.user import UserService

class AuthService:
    def __init__(self, user_repo=user_repository):
        self.user_repo = user_repo
        self.user_service = UserService(user_repo)
        self.refresh_tokens_store = {}

    def authenticate(self, db: Session, identifier: str, password: str) -> User:
        id_type = detect_identifier(identifier)

        if id_type == "email":
            user = self.user_repo.get_by_email(db, identifier)
        else:
            user = self.user_repo.get_by_phone(db, identifier)

        if not user or not verify_password(password, user.password):
            raise ValueError("Invalid credentials!")
        
        self.user_service.set_last_login(db, user)
        return user
    
    def login(self, db: Session, identifier: str, password: str) -> dict:
        user = self.authenticate(db, identifier, password)
        access_token = create_access_token({"user_id": user.id})
        refresh_token = create_access_token({"user_id": user.id})

        self.refresh_tokens_store[refresh_token] = user.id

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user
        }
    
    def refresh_access_token(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        user_id = payload.get("user_id")

        if not user_id or refresh_token not in self.refresh_tokens_store:
            raise ValueError("Expired refresh token")

        del self.refresh_tokens_store[refresh_token]

        new_access_token = create_access_token({"user_id": user_id})
        new_refresh_token = create_refresh_token({"user_id": user_id})

        self.refresh_tokens_store[new_refresh_token] = user_id

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
    

    def logout(self, refresh_token: str):
        if refresh_token in self.refresh_tokens_store:
            del self.refresh_tokens_store[refresh_token]
        return {"message": "Logged out successfully"}
    
    def verify_access_token(self, token: str) -> int:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Invalid token")
        return int(user_id)

