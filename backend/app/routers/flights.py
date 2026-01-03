from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from database import get_db
from models import Flight, Airline, Airport, Aircraft
import schemas
from typing import List, Optional
from datetime import datetime, date

router = APIRouter(prefix="/admin/flights", tags=["Flights"])

@router.post("/", response_model=schemas.FlightResponse)
def create_flight(flight_data: schemas.FlightCreate, db: Session = Depends(get_db)):
    # Kiểm tra các khóa ngoại
    airline = db.query(Airline).filter(Airline.id == flight_data.id_airline).first()
    if not airline:
        raise HTTPException(status_code=404, detail="Airline not found")
    
    # Kiểm tra airport
    dep_airport = db.query(Airport).filter(Airport.id == flight_data.dep_airport).first()
    arr_airport = db.query(Airport).filter(Airport.id == flight_data.arr_airport).first()
    if not dep_airport or not arr_airport:
        raise HTTPException(status_code=404, detail="Airport not found")
    
    # Tạo chuyến bay mới
    db_flight = Flight(**flight_data.dict())
    db.add(db_flight)
    db.commit()
    db.refresh(db_flight)
    
    # Lấy thông tin đầy đủ để trả về
    flight = db.query(Flight).filter(Flight.id == db_flight.id).first()
    
    # Lấy thông tin liên quan
    airline = db.query(Airline).filter(Airline.id == flight.id_airline).first()
    dep_airport = db.query(Airport).filter(Airport.id == flight.dep_airport).first()
    arr_airport = db.query(Airport).filter(Airport.id == flight.arr_airport).first()
    
    return {
        "id": flight.id,
        "flight_number": flight.flight_number,
        "airline_name": airline.name if airline else "",
        "departure_city": dep_airport.city if dep_airport else "",
        "arrival_city": arr_airport.city if arr_airport else "",
        "dep_datetime": flight.dep_datetime,
        "arr_datetime": flight.arr_datetime,
        "duration_minutes": flight.duration_minutes,
        "base_price_economy": flight.base_price_economy,
        "base_price_business": flight.base_price_business,
        "base_price_first": flight.base_price_first,
        "available_seats_economy": flight.available_seats_economy,
        "available_seats_business": flight.available_seats_business,
        "available_seats_first": flight.available_seats_first,
        "status": flight.status,
        "gate": flight.gate,
        "terminal": flight.terminal
    }

@router.get("/search", response_model=List[schemas.FlightResponse])
def search_flights(
    departure: Optional[str] = Query(None),
    arrival: Optional[str] = Query(None),
    departure_date: Optional[date] = Query(None),
    seat_class: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    # Query cơ bản
    flights = db.query(Flight).filter(Flight.status != 'deleted')
    
    # Áp dụng bộ lọc
    if departure:
        # Tìm airport theo city hoặc name
        airports = db.query(Airport).filter(
            or_(
                Airport.city.ilike(f"%{departure}%"),
                Airport.name.ilike(f"%{departure}%")
            )
        ).all()
        
        if airports:
            airport_ids = [a.id for a in airports]
            flights = flights.filter(Flight.dep_airport.in_(airport_ids))
        else:
            return []  # Không tìm thấy airport
    
    if arrival:
        # Tìm airport theo city hoặc name
        airports = db.query(Airport).filter(
            or_(
                Airport.city.ilike(f"%{arrival}%"),
                Airport.name.ilike(f"%{arrival}%")
            )
        ).all()
        
        if airports:
            airport_ids = [a.id for a in airports]
            flights = flights.filter(Flight.arr_airport.in_(airport_ids))
        else:
            return []  # Không tìm thấy airport
    
    if departure_date:
        flights = flights.filter(func.date(Flight.dep_datetime) == departure_date)
    
    if seat_class:
        if seat_class == 'economy':
            flights = flights.filter(Flight.available_seats_economy > 0)
        elif seat_class == 'business':
            flights = flights.filter(Flight.available_seats_business > 0)
        elif seat_class == 'first':
            flights = flights.filter(Flight.available_seats_first > 0)
    
    flights = flights.order_by(Flight.dep_datetime).all()
    
    # Format response
    response = []
    for flight in flights:
        airline = db.query(Airline).filter(Airline.id == flight.id_airline).first()
        dep_airport = db.query(Airport).filter(Airport.id == flight.dep_airport).first()
        arr_airport = db.query(Airport).filter(Airport.id == flight.arr_airport).first()
        
        response.append({
            "id": flight.id,
            "flight_number": flight.flight_number,
            "airline_name": airline.name if airline else "",
            "departure_city": dep_airport.city if dep_airport else "",
            "arrival_city": arr_airport.city if arr_airport else "",
            "dep_datetime": flight.dep_datetime,
            "arr_datetime": flight.arr_datetime,
            "duration_minutes": flight.duration_minutes,
            "base_price_economy": flight.base_price_economy,
            "base_price_business": flight.base_price_business,
            "base_price_first": flight.base_price_first,
            "available_seats_economy": flight.available_seats_economy,
            "available_seats_business": flight.available_seats_business,
            "available_seats_first": flight.available_seats_first,
            "status": flight.status,
            "gate": flight.gate,
            "terminal": flight.terminal
        })
    
    return response

@router.get("/{flight_id}", response_model=schemas.FlightResponse)
def get_flight_detail(flight_id: int, db: Session = Depends(get_db)):
    flight = db.query(Flight).filter(Flight.id == flight_id).first()
    
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    
    airline = db.query(Airline).filter(Airline.id == flight.id_airline).first()
    dep_airport = db.query(Airport).filter(Airport.id == flight.dep_airport).first()
    arr_airport = db.query(Airport).filter(Airport.id == flight.arr_airport).first()
    
    return {
        "id": flight.id,
        "flight_number": flight.flight_number,
        "airline_name": airline.name if airline else "",
        "departure_city": dep_airport.city if dep_airport else "",
        "arrival_city": arr_airport.city if arr_airport else "",
        "dep_datetime": flight.dep_datetime,
        "arr_datetime": flight.arr_datetime,
        "duration_minutes": flight.duration_minutes,
        "base_price_economy": flight.base_price_economy,
        "base_price_business": flight.base_price_business,
        "base_price_first": flight.base_price_first,
        "available_seats_economy": flight.available_seats_economy,
        "available_seats_business": flight.available_seats_business,
        "available_seats_first": flight.available_seats_first,
        "status": flight.status,
        "gate": flight.gate,
        "terminal": flight.terminal
    }
# ========== UPDATE ==========
@router.put("/{flight_id}")
def update_flight(
    flight_id: int,
    flight_data: schemas.FlightUpdate,
    db: Session = Depends(get_db)
):
    """
    Chỉnh sửa chuyến bay
    """
    try:
        # Tìm chuyến bay cần sửa
        flight = db.query(Flight).filter(
            Flight.id == flight_id,
            Flight.status != 'deleted'
        ).first()
        
        if not flight:
            raise HTTPException(status_code=404, detail="Flight not found")
        
        # Kiểm tra các khóa ngoại nếu có update
        update_data = flight_data.dict(exclude_unset=True)
        
        if 'id_airline' in update_data:
            airline = db.query(Airline).filter(Airline.id == update_data['id_airline']).first()
            if not airline:
                raise HTTPException(status_code=404, detail="Airline not found")
        
        if 'id_aircraft' in update_data:
            aircraft = db.query(Aircraft).filter(Aircraft.id == update_data['id_aircraft']).first()
            if not aircraft:
                raise HTTPException(status_code=404, detail="Aircraft not found")
        
        if 'dep_airport' in update_data:
            dep_airport = db.query(Airport).filter(Airport.id == update_data['dep_airport']).first()
            if not dep_airport:
                raise HTTPException(status_code=404, detail="Departure airport not found")
        
        if 'arr_airport' in update_data:
            arr_airport = db.query(Airport).filter(Airport.id == update_data['arr_airport']).first()
            if not arr_airport:
                raise HTTPException(status_code=404, detail="Arrival airport not found")
        
        # Cập nhật các trường
        for field, value in update_data.items():
            setattr(flight, field, value)
        
        # Cập nhật thời gian sửa
        flight.updated_at = datetime.now()
        
        db.commit()
        db.refresh(flight)
        
        # Lấy thông tin đầy đủ để trả về
        airline = db.query(Airline).filter(Airline.id == flight.id_airline).first()
        dep_airport = db.query(Airport).filter(Airport.id == flight.dep_airport).first()
        arr_airport = db.query(Airport).filter(Airport.id == flight.arr_airport).first()
        
        return {
            "id": flight.id,
            "flight_number": flight.flight_number,
            "airline_name": airline.name if airline else "",
            "departure_city": dep_airport.city if dep_airport else "",
            "arrival_city": arr_airport.city if arr_airport else "",
            "dep_datetime": flight.dep_datetime,
            "arr_datetime": flight.arr_datetime,
            "duration_minutes": flight.duration_minutes,
            "base_price_economy": flight.base_price_economy,
            "base_price_business": flight.base_price_business,
            "base_price_first": flight.base_price_first,
            "available_seats_economy": flight.available_seats_economy,
            "available_seats_business": flight.available_seats_business,
            "available_seats_first": flight.available_seats_first,
            "status": flight.status,
            "gate": flight.gate,
            "terminal": flight.terminal,
            "message": "Flight updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating flight: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/{flight_id}")
def delete_flight(flight_id: int, db: Session = Depends(get_db)):
    flight = db.query(Flight).filter(Flight.id == flight_id).first()
    
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    
    # Chuyển status thành 'deleted' thay vì xóa
    flight.status = 'deleted'
    flight.updated_at = datetime.now()
    
    db.commit()
    
    return {"message": "Flight deleted successfully"}