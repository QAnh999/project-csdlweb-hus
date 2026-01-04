from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from controllers.checkin import CheckinController
from core.database import get_db
from schemas.checkin import CheckinConfirmResponse, CheckinInfoResponse

router = APIRouter(prefix="/checkin", tags=["Check-in"])
checkin_controller = CheckinController()

@router.get("/online", response_model=CheckinInfoResponse)
def get_checkin_info(reservation_code: str, db: Session = Depends(get_db)):
    return checkin_controller.get_checkin_info(db, reservation_code)

@router.post("/{reservation_detail_id}/confirm", response_model=CheckinConfirmResponse)
def confirm_checkin(reservation_detail_id: int, db: Session = Depends(get_db)):
    return checkin_controller.confirm_checkin(db, reservation_detail_id)

