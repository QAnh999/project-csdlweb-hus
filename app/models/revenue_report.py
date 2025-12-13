from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.core.database import Base

class RevenueReports(Base):
    __tablename__ = "revenue_reports"

    id = Column(Integer, primary_key=True, index=True)
    period_start = Column(Date)
    period_end = Column(Date)
    staff_id = Column(Integer, ForeignKey("staff.admin_id"))

    generated_by_staff = relationship("Staff", back_populates="revenue_reports")
