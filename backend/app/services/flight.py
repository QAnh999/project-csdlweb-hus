from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from repositories.flight import flight_repository
from models import Flight
from datetime import date

class FlightService:
    def __init__(self):
        self.repo = flight_repository

    def _search_one_way(
            self, 
            db: Session, 
            from_airport: int, 
            to_airport: int, 
            dep_date: date, 
            cabin_class: str, 
            num_seats: int
    ) -> List[dict]:
        
        flights = self.repo.search(db=db, dep_airport=from_airport, arr_airport=to_airport, dt=dep_date)
        
        result = []
        for f in flights:
            if cabin_class == "economy":
                price = f.base_price_economy
                seats = f.available_seats_economy
            elif cabin_class == "business":
                price = f.base_price_business
                seats = f.available_seats_business
            elif cabin_class == "first":
                price = f.base_price_first
                seats = f.available_seats_first
            else:
                continue

            if not seats or seats < num_seats:
                continue

            result.append({
                "flight_id": f.id,
                "flight_number": f.flight_number,
                "airline_name": f.airline.name,
                # "airline_code": f.airline.code,
                # "airline_logo": f.airline.logo_url,
                "dep_airport": f.dep_airport,
                "arr_airport": f.arr_airport,
                "dep_datetime": f.dep_datetime,
                "arr_datetime": f.arr_datetime,
                "duration_minutes": f.duration_minutes,
                "cabin_class": cabin_class,
                "price": price,
                "available_seats": seats
            })

        return result

    def search_flights(
            self, 
            db: Session, 
            from_airport: int, 
            to_airport: int, 
            dep_date: date, 
            cabin_class: str, 
            adult: int,
            child: int,
            infant: int, 
            trip_type: str = "one-way",
            ret_date: Optional[date] = None
    ) -> Dict[str, List[dict]]:
        
        infant = 0  # Ignore infants for seat availability
        num_seats = adult + child + infant

        outbound = self._search_one_way(
            db=db,
            from_airport=from_airport,
            to_airport=to_airport,
            dep_date=dep_date,
            cabin_class=cabin_class,
            num_seats=num_seats
        )   

        if not outbound:
            raise ValueError("No suitable outbound flights found")  

        inbound = None
        if trip_type == "round-trip":
            if not ret_date:
                raise ValueError("Return date is required for round-trip searches")
            inbound = self._search_one_way(
                db=db,
                from_airport=to_airport,
                to_airport=from_airport,
                dep_date=ret_date,
                cabin_class=cabin_class,
                num_seats=num_seats
            )

            if not inbound:
                raise ValueError("No suitable inbound flights found")
            
        return {
            "main_flights": outbound,
            "return_flights": inbound
        }
    
flight_service = FlightService()
    