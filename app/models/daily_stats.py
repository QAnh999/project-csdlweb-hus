from sqlalchemy import Column, Integer, Date, DateTime, DECIMAL
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class DailyStat(Base):
    __tablename__ = "daily_stats"

    id = Column(Integer, primary_key=True, index=True)
    stat_date = Column(Date, nullable=False, unique=True)

    completed_flights = Column(Integer, default=0)
    active_flights = Column(Integer, default=0)
    cancelled_flights = Column(Integer, default=0)
    total_revenue = Column(DECIMAL(12,2), default=0)
    tickets_sold = Column(Integer, default=0)

    prev_completed_flights = Column(Integer, default=0)
    prev_active_flights = Column(Integer, default=0)
    prev_cancelled_flights = Column(Integer, default=0)
    prev_revenue = Column(DECIMAL(12,2), default=0)
    prev_tickets_sold = Column(Integer, default=0)

    calculated_at = Column(DateTime, default=datetime.utcnow)

    report_links = relationship("ReportDailyLink", back_populates="daily_stat")
