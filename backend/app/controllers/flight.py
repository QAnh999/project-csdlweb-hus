from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from schemas.flight import FlightSearchRequest, FlightSearchResult, FlightSearchResponse, PassengerSummary, FlightResponse
from services.flight import FlightService
from repositories.flight import FlightRepository

class FlightController:
    def __init__(self):
        self.service = FlightService()
        self.repository = FlightRepository()

    def search_flights(self, params: FlightSearchRequest, db: Session) -> FlightSearchResponse:
        try:
            result = self.service.search_flights(
                db=db,
                **params.model_dump()
            )
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        
        main_flights = [FlightSearchResult.model_validate(f) for f in result.get("main_flights", [])]
        return_flights = None
        if params.trip_type == "round-trip" and result.get("return_flights"):
            return_flights = [FlightSearchResult.model_validate(f) for f in result.get("return_flights", [])]

        return FlightSearchResponse(
            passengers=PassengerSummary(
                adult=params.adult,
                child=params.child,
                infant=params.infant
            ),
            main_flights=main_flights,
            return_flights=return_flights
        )
    

    def display_flight(self, flight_id: int, db: Session) -> FlightResponse:
        flight = self.repository.get(db, flight_id) 
        if not flight:
            raise HTTPException(status_code=404, detail="Flight not found")
        
        return FlightResponse.model_validate(flight)
    
flight_controller = FlightController()