# app/routes/flights.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.database.session import get_db
from app.services.flight_service import FlightService
from app.schemas.flight import FlightCreate, FlightUpdate, FlightResponse

router = APIRouter(
    prefix="/flights",
    tags=["flights"]
)

# POST /flights - Thêm chuyến bay
@router.post("/", response_model=FlightResponse, status_code=status.HTTP_201_CREATED)
def create_flight(
    flight_data: FlightCreate,
    db: Session = Depends(get_db)
):
    try:
        flight_service = FlightService()
        flight = flight_service.create_flight(db, flight_data)
        return flight_service.format_flight_response(flight)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating flight: {str(e)}"
        )

# GET /flights/:id - Xem chi tiết 1 chuyến bay
@router.get("/{flight_id}", response_model=FlightResponse)
def get_flight(
    flight_id: int,
    db: Session = Depends(get_db)
):
    flight_service = FlightService()
    flight = flight_service.get_flight_by_id(db, flight_id)
    
    if not flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight not found"
        )
    
    return flight_service.format_flight_response(flight)

# GET /flights - Danh sách chuyến bay (hỗ trợ Search/Filter/Sort)
@router.get("/", response_model=List[FlightResponse])
def get_flights(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search by flight number or gate"),
    airline_id: Optional[int] = Query(None, gt=0, description="Filter by airline ID"),
    dep_airport: Optional[int] = Query(None, gt=0, description="Filter by departure airport ID"),
    arr_airport: Optional[int] = Query(None, gt=0, description="Filter by arrival airport ID"),
    dep_date_from: Optional[datetime] = Query(None, description="Filter by departure date from"),
    dep_date_to: Optional[datetime] = Query(None, description="Filter by departure date to"),
    status: Optional[str] = Query(None, description="Filter by status"),
    sort_by: str = Query("dep_datetime", description="Field to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc/desc)"),
    db: Session = Depends(get_db)
):
    flight_service = FlightService()
    
    # Validate sort order
    if sort_order.lower() not in ["asc", "desc"]:
        sort_order = "asc"
    
    flights = flight_service.get_flights(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        airline_id=airline_id,
        dep_airport=dep_airport,
        arr_airport=arr_airport,
        dep_date_from=dep_date_from,
        dep_date_to=dep_date_to,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    return [flight_service.format_flight_response(flight) for flight in flights]

# DELETE /flights/:id - Xóa chuyến bay
@router.delete("/{flight_id}")
def delete_flight(
    flight_id: int,
    db: Session = Depends(get_db)
):
    flight_service = FlightService()
    success = flight_service.delete_flight(db, flight_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight not found"
        )
    
    return {"message": "Deleted"}

# PUT /flights/:id - Cập nhật chuyến bay (optional)
@router.put("/{flight_id}", response_model=FlightResponse)
def update_flight(
    flight_id: int,
    flight_data: FlightUpdate,
    db: Session = Depends(get_db)
):
    flight_service = FlightService()
    updated_flight = flight_service.update_flight(db, flight_id, flight_data)
    
    if not updated_flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight not found"
        )
    
    return flight_service.format_flight_response(updated_flight)