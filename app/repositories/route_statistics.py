from app.repositories.base import BaseRepository
from app.models.route_statistics import RouteStatistics
from app.schemas.route_statistics import RouteStatisticsCreate, RouteStatisticsUpdate

class RouteStatisticsRepository(BaseRepository[RouteStatistics, RouteStatisticsCreate, RouteStatisticsUpdate]):

    def __init__(self):
        super().__init__(RouteStatistics)


route_statistics_repository = RouteStatisticsRepository()
