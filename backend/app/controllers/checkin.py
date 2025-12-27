from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.checkin import CheckinConfirmResponse, CheckinInfoResponse
from app.services.checkin import checkin_service

class CheckinController:

    def get_checkin_info(self, db: Session, reservation_code: str):
        try:
            checkin_info = checkin_service.get_checkin_info(
                db=db,
                code=reservation_code
            )
            return CheckinInfoResponse(passengers=checkin_info)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        
    def confirm_checkin(self, db: Session, reservation_detail_id: int):
        try:
            confirmed = checkin_service.confirm_checkin(
                db=db,
                reservation_detail_id=reservation_detail_id
            )
            return CheckinConfirmResponse(ticket = confirmed)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

