from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import HTTPException, status #, Depends
from fastapi.security import OAuth2PasswordBearer
# from sqlalchemy.orm import Session
from app.core.config import settings
# from app.core.database import get_db
# from app.repositories.user import user_repository
# from app.models.user import User


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") 

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

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
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
#     try:
#         payload = decode_token(token)
#         user_id: int = payload.get("user_id")
        
#         if user_id is None:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid token"
#             )
#         return user_id
#     except Exception:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Could not verify user"
#         )
    


# def get_user_by_refresh_token(refresh_token: str, db: Session = Depends(get_db)) -> User:
#     try:
#         payload = decode_token(refresh_token)
#         user_id = payload.get("user_id")
#     except Exception:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

#     if not user_id:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

#     user = user_repository.get(db, user_id)
#     if not user or not user.is_active:
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User inactive or deleted")

#     return user


    