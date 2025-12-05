from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), nullable=False)
    base_price = Column(Numeric(10, 2), nullable=False)
    is_available = Column(Boolean, default=True)
    
    reservation_services = relationship("ReservationService", back_populates="service")