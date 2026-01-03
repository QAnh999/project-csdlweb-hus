from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.controllers.checkin import CheckinController
from app.core.database import get_db
from app.schemas.checkin import CheckinConfirmResponse, CheckinInfoResponse, TicketResponseWrapper

router = APIRouter(prefix="/checkin", tags=["Check-in"])
checkin_controller = CheckinController()

# @router.get("/online", response_model=CheckinInfoResponse)
# def get_checkin_info(reservation_code: str, db: Session = Depends(get_db)):
#     return checkin_controller.get_checkin_info(db, reservation_code)

@router.get("/online", response_model=CheckinInfoResponse)
def get_checkin_info(reservation_code: str, flight_id: int, db: Session = Depends(get_db)):
    return checkin_controller.get_checkin_info(db, reservation_code, flight_id)


@router.post("/{reservation_detail_id}/confirm", response_model=CheckinConfirmResponse)
def confirm_checkin(reservation_detail_id: int, db: Session = Depends(get_db)):
    return checkin_controller.confirm_checkin(db, reservation_detail_id)

@router.get("/{reservation_detail_id}/ticket", response_model=TicketResponseWrapper)
def get_ticket(reservation_detail_id: int, db: Session = Depends(get_db)):
    return checkin_controller.get_ticket(db, reservation_detail_id)