from sqlalchemy.orm import Session
from fastapi import HTTPException
# from app.models.user import User
from app.services.auth import AuthService
from app.repositories.user import user_repository
from app.schemas.auth import LoginResponse, TokenResponse

class AuthController:
    def __init__(self):
        self.auth_service = AuthService(user_repository)


    def login(self, db: Session, identifier: str, password: str) -> LoginResponse:
        try:
            payload = self.auth_service.login(db, identifier, password)
            return LoginResponse.model_validate(payload)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        

    def refresh(self, refresh_token: str) -> TokenResponse:
        try:
            # user_id = self.auth_service.refresh_tokens_store.get(refresh_token)
            # if not user_id:
            #     raise ValueError("Invalid token")
            
            # user = self.auth_service.user_repo.get(db, user_id)
            payload = self.auth_service.refresh_access_token(refresh_token)

            return TokenResponse.model_validate(payload)
        except ValueError as e:
            raise HTTPException(status_code=401, detail=str(e))
        
    def logout(self, refresh_token: str):
        try:    
            # user_id = self.auth_service.refresh_tokens_store.get(refresh_token)
            # if not user_id:
            #     raise ValueError("Invalid Token")
            
            # user = self.auth_service.user_repo.get(db, user_id)
            return self.auth_service.logout(refresh_token)
        except ValueError as e:
            raise HTTPException(status_code=401, detail=str(e))
    

auth_controller = AuthController()
        