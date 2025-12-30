from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.controllers.flight import flight_controller
from app.schemas.flight import FlightSearchRequest, FlightSearchResponse
from app.core.database import get_db

router = APIRouter(prefix="/flight", tags=["Flight"])

@router.post("/search", response_model=FlightSearchResponse)
def search_flight(params: FlightSearchRequest, db: Session = Depends(get_db)):
    """
    Tìm kiếm chuyến bay:
    - nơi đi, nơi đến
    - ngày đi, ngày trở về (nếu khứ hồi)
    - hạng ghế
    - số lượng hành khách: người lớn, trẻ em, trẻ sơ sinh
    """
    return flight_controller.search_flights(params=params, db=db)