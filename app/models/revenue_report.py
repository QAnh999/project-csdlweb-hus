from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class RevenueReport(Base):
    __tablename__ = "revenue_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String(20), nullable=False)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)

    total_revenue = Column(DECIMAL(12,2), default=0)
    revenue_from_tickets = Column(DECIMAL(12,2), default=0)
    revenue_from_services = Column(DECIMAL(12,2), default=0)
    total_refunds = Column(DECIMAL(12,2), default=0)
    total_bookings = Column(Integer, default=0)
    confirmed_bookings = Column(Integer, default=0)
    cancelled_bookings = Column(Integer, default=0)
    new_customers = Column(Integer, default=0)
    avg_booking_value = Column(DECIMAL(10,2), default=0)
    cancellation_rate = Column(DECIMAL(5,2), default=0)
    customer_growth_rate = Column(DECIMAL(5,2), default=0)

    generated_at = Column(DateTime, default=datetime.utcnow)
    generated_by = Column(Integer, ForeignKey("staff.admin_id"))
    is_finalized = Column(Boolean, default=False)

    generated_by_staff = relationship("Staff", back_populates="revenue_reports")
    daily_links = relationship("ReportDailyLink", back_populates="report")
