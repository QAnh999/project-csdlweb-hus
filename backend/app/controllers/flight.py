from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas.flight import FlightSearchRequest, FlightSearchResult, FlightSearchResponse
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
        
        return FlightSearchResponse.model_validate(
            main_flights=[
                FlightSearchResult.model_validate(f) 
                for f in result.get("main_flights", [])
            ],
            return_flights=[
                FlightSearchResult.model_validate(f) 
                for f in result.get("return_flights", [])
            ] if params.trip_type == "round-trip" else []
        )
    
flight_controller = FlightController()