from app.repositories.base import BaseRepository
from app.models.report_daily_link import ReportDailyLink
from app.schemas.report_daily_link import ReportDailyLinkCreate, ReportDailyLinkUpdate

class ReportDailyLinkRepository(BaseRepository[ReportDailyLink, ReportDailyLinkCreate, ReportDailyLinkUpdate]):

    def __init__(self):
        super().__init__(ReportDailyLink)


report_daily_link_repository = ReportDailyLinkRepository()
