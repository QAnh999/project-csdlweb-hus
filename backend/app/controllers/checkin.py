from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from schemas.checkin import CheckinConfirmResponse, CheckinInfoResponse, TicketResponseWrapper
from services.checkin import checkin_service

class CheckinController:

    # def get_checkin_info(self, db: Session, reservation_code: str):
    #     try:
    #         checkin_info = checkin_service.get_checkin_info(
    #             db=db,
    #             code=reservation_code
    #         )
    #         print(f"Returning {len(checkin_info)} passengers")  # Debug
    #         return CheckinInfoResponse(passengers=checkin_info)
    #     except ValueError as e:
    #         raise HTTPException(
    #             status_code=status.HTTP_404_NOT_FOUND,
    #             detail=str(e)
    #         )
        
    def get_checkin_info(self, db: Session, reservation_code: str, flight_id: int):
        try:
            checkin_info = checkin_service.get_checkin_info(
                db=db,
                reservation_code=reservation_code,
                flight_id=flight_id
            )
            print(f"Returning {len(checkin_info)} passengers")  # Debug
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

    def get_ticket(self, db: Session, reservation_detail_id: int):
        try: 
            ticket= checkin_service.display_ticket(db, reservation_detail_id)
            return TicketResponseWrapper(ticket=ticket)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

