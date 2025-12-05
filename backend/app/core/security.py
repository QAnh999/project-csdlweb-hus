from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError

from app.core.config import settings 


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") 

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> str:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_minutes: int = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes = expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_minutes: int = None):
    return create_access_token(data, expires_minutes=expires_minutes or settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=settings.ALGORITHM)
        return payload
    except JWTError:
        raise ValueError("Invalid token")
    