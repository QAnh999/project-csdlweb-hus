from app.repositories.base import BaseRepository
from app.models.daily_stats import DailyStats
from app.schemas.daily_stats import DailyStatsCreate, DailyStatsUpdate

class DailyStatsRepository(BaseRepository[DailyStats, DailyStatsCreate, DailyStatsUpdate]):

    def __init__(self):
        super().__init__(DailyStats)


daily_stats_repository = DailyStatsRepository()
