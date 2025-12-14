from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.controllers.user import user_controller
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])

# GET /users/{id}
@router.get("/user_id", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return user_controller.get_user(user_id, db)

# GET /users
@router.get("/", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return user_controller.get_all_users(db)

# POST /users
@router.post("/", response_model=UserResponse, status_code=201)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    return user_controller.create_user(data, db)

# PUT /users/{id}
@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    return user_controller.update_user(user_id, data, db)

# DELETE /users/{id}
@router.delete("/{user_id}")
def delete_user(user_id, db: Session = Depends(get_db)):
    return user_controller.delete_user(user_id, db)

# PATCH /users/{id}/change-password
@router.patch("/{user_id}/change-password")
def change_password(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    return user_controller.change_password(user_id, data, db)
