from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.revenue_report import RevenueReports
from app.schemas.revenue_reports import RevenueReportCreate, RevenueReportUpdate

class RevenueReportRepository(BaseRepository[RevenueReports, RevenueReportCreate, RevenueReportUpdate]):

    def __init__(self):
        super().__init__(RevenueReports)

    def get_by_period(self, db: Session, start, end):
        return (db.query(RevenueReports)
                  .filter(
                      RevenueReports.period_start == start,
                      RevenueReports.period_end == end
                  )
                  .first())


revenue_report_repository = RevenueReportRepository()
