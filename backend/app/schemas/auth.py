from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.schemas.user import UserResponse

class LoginRequest(BaseModel):
    identifier: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class LogoutRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str = None
    token_type: str = "bearer"

class LoginResponse(TokenResponse):
    user: UserResponse

    model_config = ConfigDict(from_attributes=True)
