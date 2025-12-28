# app/services/flight_service.py
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, asc
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.flight import Flight
from app.models.airport import Airport
from app.models.airline import Airline
from app.models.aircraft import Aircraft
from app.schemas.flight import FlightCreate, FlightUpdate, FlightResponse

class FlightService:
    
    # CREATE
    def create_flight(self, db: Session, flight_data: FlightCreate) -> Flight:
        # Kiểm tra ràng buộc
        if flight_data.dep_airport == flight_data.arr_airport:
            raise ValueError("Departure and arrival airports cannot be the same")
        
        # Kiểm tra tổng số ghế
        total_available = (
            flight_data.available_seats_economy + 
            (flight_data.available_seats_business or 0) + 
            (flight_data.available_seats_first or 0)
        )
        if total_available > flight_data.total_seats:
            raise ValueError("Total available seats cannot exceed total seats")
        
        # Tạo flight object
        db_flight = Flight(**flight_data.model_dump())
        
        db.add(db_flight)
        db.commit()
        db.refresh(db_flight)
        return db_flight
    
    # READ - Single
    def get_flight_by_id(self, db: Session, flight_id: int) -> Optional[Flight]:
        return db.query(Flight)\
            .options(
                joinedload(Flight.airline),
                joinedload(Flight.aircraft),
                joinedload(Flight.departure_airport),
                joinedload(Flight.arrival_airport)
            )\
            .filter(Flight.id == flight_id)\
            .first()
    
    # READ - List với search/filter/sort
    def get_flights(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        airline_id: Optional[int] = None,
        dep_airport: Optional[int] = None,
        arr_airport: Optional[int] = None,
        dep_date_from: Optional[datetime] = None,
        dep_date_to: Optional[datetime] = None,
        status: Optional[str] = None,
        sort_by: str = "dep_datetime",
        sort_order: str = "asc"
    ) -> List[Flight]:
        
        query = db.query(Flight)\
            .options(
                joinedload(Flight.airline),
                joinedload(Flight.departure_airport),
                joinedload(Flight.arrival_airport)
            )
        
        # Apply filters
        filters = []
        
        if search:
            filters.append(
                or_(
                    Flight.flight_number.ilike(f"%{search}%"),
                    Flight.gate.ilike(f"%{search}%")
                )
            )
        
        if airline_id:
            filters.append(Flight.id_airline == airline_id)
        
        if dep_airport:
            filters.append(Flight.dep_airport == dep_airport)
        
        if arr_airport:
            filters.append(Flight.arr_airport == arr_airport)
        
        if dep_date_from:
            filters.append(Flight.dep_datetime >= dep_date_from)
        
        if dep_date_to:
            filters.append(Flight.dep_datetime <= dep_date_to)
        
        if status:
            filters.append(Flight.status == status)
        
        if filters:
            query = query.filter(and_(*filters))
        
        # Apply sorting
        if hasattr(Flight, sort_by):
            if sort_order.lower() == "desc":
                query = query.order_by(desc(getattr(Flight, sort_by)))
            else:
                query = query.order_by(asc(getattr(Flight, sort_by)))
        
        # Pagination
        return query.offset(skip).limit(limit).all()
    
    # UPDATE
    def update_flight(self, db: Session, flight_id: int, flight_data: FlightUpdate) -> Optional[Flight]:
        db_flight = db.query(Flight).filter(Flight.id == flight_id).first()
        if not db_flight:
            return None
        
        # Cập nhật chỉ các trường được cung cấp
        update_data = flight_data.model_dump(exclude_unset=True)
        
        # Cập nhật seat counts (đảm bảo không vượt quá total_seats)
        if 'available_seats_economy' in update_data:
            if update_data['available_seats_economy'] > db_flight.total_seats:
                raise ValueError("Available seats cannot exceed total seats")
        
        for field, value in update_data.items():
            setattr(db_flight, field, value)
        
        db.commit()
        db.refresh(db_flight)
        return db_flight
    
    # DELETE
    def delete_flight(self, db: Session, flight_id: int) -> bool:
        db_flight = db.query(Flight).filter(Flight.id == flight_id).first()
        if not db_flight:
            return False
        
        db.delete(db_flight)
        db.commit()
        return True
    
    # Helper methods
    def format_flight_response(self, flight: Flight) -> Dict[str, Any]:
        """Format flight data with related information"""
        if not flight:
            return None
        
        response = {
            "id": flight.id,
            "flight_number": flight.flight_number,
            "dep_datetime": flight.dep_datetime,
            "arr_datetime": flight.arr_datetime,
            "duration_minutes": flight.duration_minutes,
            "base_price_economy": flight.base_price_economy,
            "base_price_business": flight.base_price_business,
            "base_price_first": flight.base_price_first,
            "status": flight.status,
            "gate": flight.gate,
            "terminal": flight.terminal,
            "available_seats_economy": flight.available_seats_economy,
            "available_seats_business": flight.available_seats_business or 0,
            "available_seats_first": flight.available_seats_first or 0,
            "created_at": flight.created_at,
            "updated_at": flight.updated_at,
        }
        
        # Add airline info
        if flight.airline:
            response["airline_name"] = flight.airline.name
            response["airline_code"] = flight.airline.code
        
        # Add aircraft info
        if flight.aircraft:
            response["aircraft_model"] = flight.aircraft.model
        
        # Add departure airport info
        if flight.departure_airport:
            response["dep_airport_code"] = flight.departure_airport.iata or flight.departure_airport.icao
            response["dep_airport_name"] = flight.departure_airport.name
            response["dep_city"] = flight.departure_airport.city
        
        # Add arrival airport info
        if flight.arrival_airport:
            response["arr_airport_code"] = flight.arrival_airport.iata or flight.arrival_airport.icao
            response["arr_airport_name"] = flight.arrival_airport.name
            response["arr_city"] = flight.arrival_airport.city
        
        return response