from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Staff(Base):
    __tablename__ = "staff"

    admin_id = Column(Integer, primary_key=True, index=True)
    admin_name = Column(String(100), nullable=False)
    password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    avatar = Column(String(255), nullable=False)

    revenue_reports = relationship("RevenueReport", back_populates="generated_by_staff")
