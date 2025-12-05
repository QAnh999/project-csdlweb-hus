from app.repositories.base import BaseRepository
from app.models.flight_statistics import FlightStatistics
from app.schemas.flight_statistics import FlightStatisticsCreate, FlightStatisticsUpdate

class FlightStatisticsRepository(BaseRepository[FlightStatistics, FlightStatisticsCreate, FlightStatisticsUpdate]):

    def __init__(self):
        super().__init__(FlightStatistics)


flight_statistics_repository = FlightStatisticsRepository()
