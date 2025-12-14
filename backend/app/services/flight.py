from sqlalchemy.orm import Session
from app.repositories.flight import flight_repository
from app.models.flight import Flight
from datetime import date

class FlightService:
    def __init__(self, repo):
        self.repo = flight_repository

    # def validate_search_params(self, db: Session, from_airport: int, to_airport, dep_date: date, cabin_class: str, num_psg: int) -> tuple[bool, Optional[str]]:
    #     """
    #     Kiểm tra các tham số tìm kiếm
    #     """
    #     if from_airport == to_airport:
    #         return False, "Điểm đi và điểm đến trùng nhau!"
        
    #     if dep_date < date.today():
    #         return False, "Thời gian đi đã qua!"
        
        
    

    def search_flights(self, db: Session, from_airport: int, to_airport, dep_date: date, cabin_class: str, num_psg: int):
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

            if not seats or seats < num_psg:
                continue

            result.append({
                "flight_id": f.id,
                "flight_number": f.flight_number,
                "airline_name": f.airline.name,
                "airline_code": f.airline.code,
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
    