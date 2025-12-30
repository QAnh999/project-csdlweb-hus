from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas.flight import FlightSearchRequest, FlightSearchResult, FlightSearchResponse, PassengerSummary
from app.services.flight import FlightService


class FlightController:
    def __init__(self):
        self.service = FlightService()

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
    
flight_controller = FlightController()