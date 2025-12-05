from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class ReportDailyLink(Base):
    __tablename__ = "report_daily_link"

    id = Column(Integer, primary_key=True, index=True)

    report_id = Column(Integer, ForeignKey("revenue_reports.id", ondelete="CASCADE"), nullable=False)
    daily_stat_id = Column(Integer, ForeignKey("daily_stats.id", ondelete="CASCADE"), nullable=False)

    report = relationship("RevenueReport", back_populates="daily_links")
    daily_stat = relationship("DailyStat", back_populates="report_links")
