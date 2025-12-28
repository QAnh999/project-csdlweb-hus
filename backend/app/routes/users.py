from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.services.user_service import UserService
from app.utils.dependencies import require_super_admin, get_current_staff

router = APIRouter(prefix="/users", tags=["Users"])
service = UserService()


@router.get("/", response_model=list[UserOut])
def get_users(
    db: Session = Depends(get_db),
    staff=Depends(get_current_staff)
):
    return service.get_all(db)


@router.get("/{user_id}", response_model=UserOut)
def get_user_detail(
    user_id: int,
    db: Session = Depends(get_db),
    staff=Depends(get_current_staff)
):
    return service.get_by_id(db, user_id)


@router.post("/", response_model=UserOut)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    _=Depends(require_super_admin)
):
    return service.create(db, data)


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    staff=Depends(get_current_staff)
):
    return service.update(db, user_id, data)


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_super_admin)
):
    return service.delete(db, user_id)


@router.get("/{user_id}/history")
def user_history(
    user_id: int,
    db: Session = Depends(get_db),
    staff=Depends(get_current_staff)
):
    """
    Tạm thời trả lịch sử rỗng.
    Khi gắn bookings / reservations sẽ join vào đây.
    """
    service.get_by_id(db, user_id)
    return {
        "user_id": user_id,
        "history": []
    }
