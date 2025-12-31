from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.controllers.auth import auth_controller
from app.schemas.auth import LoginRequest, RefreshRequest, LogoutRequest, LoginResponse, TokenResponse
from app.core.database import get_db


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    return auth_controller.login(db, request.identifier, request.password)

@router.post("/refresh", response_model=TokenResponse)
def refresh(request: RefreshRequest):
    return auth_controller.refresh(request.refresh_token)

@router.post("/logout")
def logout(request: LogoutRequest):
    return auth_controller.logout(request.refresh_token)



