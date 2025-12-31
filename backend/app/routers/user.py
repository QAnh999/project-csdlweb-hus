from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependency import get_current_user_id
from app.core.database import get_db
from app.controllers.user import user_controller
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserPassword
from typing import List

router = APIRouter(prefix="/user", tags=["User"])

# GET /users/{id} --> get an user by user_id
@router.get("/get-me", response_model=UserResponse)
def get_user(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return user_controller.get_user(user_id, db)

# # GET /users --> list all users for admin
# @router.get("/", response_model=List[UserResponse])
# def get_all_users(db: Session = Depends(get_db)):
#     return user_controller.get_all_users(db)

# POST /users --> create an user account
@router.post("/create-an-account", response_model=UserResponse, status_code=201)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    return user_controller.create_user(data, db)

# PATCH /users/update-profile --> update partial
@router.patch("/update-profile", response_model=UserResponse)
def update_user(data: UserUpdate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return user_controller.update_user(user_id, data, db)

# DELETE /users/delete-me --> delete user
@router.delete("/delete-me")
def delete_user(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """
    Không xóa record, chỉ đổi status sang deleted thôi.
    """
    return user_controller.delete_user(user_id, db)

# PATCH /users/change-password --> change user's password
@router.patch("/change-password")
def change_password(data: UserPassword, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return user_controller.change_password(user_id, data, db)

