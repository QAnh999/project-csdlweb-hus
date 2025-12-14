from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas.flight import FlightSearchRequest, FlightSearchResult, FlightSearchResponse
from app.services.flight import FlightService
from app.repositories.flight import flight_repository


class FlightController:
    def __init__(self):
        self.service = FlightService(flight_repository)

    def search_flights(self, params: FlightSearchRequest, db: Session) -> FlightSearchResponse:
        num_psg = params.adult + params.children + params.infant

        main_flights = self.service.search_flights(
            db=db,
            from_airport=params.from_airport,
            to_airport=params.to_airport,
            dep_date=params.dep_date,
            cabin_class=params.cabin_class,
            num_psg=num_psg
        )
        
        if not main_flights:
            raise HTTPException(status_code=404, detail="Suitable flight not found!")

        return_flights: Optional[List] = None
        if params.trip_type == "round-trip" and params.ret_date:
            return_flights = self.service.search_flights(
                db=db,
                from_airport=params.to_airport,
                to_airport=params.from_airport,
                dep_date=params.ret_date,
                cabin_class=params.cabin_class,
                num_psg=num_psg
            )

        main_flights = [FlightSearchResult.model_validate(f) for f in main_flights]
        return_flights = [FlightSearchResult.model_validate(f) for f in return_flights] if return_flights else None

        return FlightSearchResponse(
            main_flights=main_flights,
            return_flights=return_flights
        )
    
flight_controller = FlightController()