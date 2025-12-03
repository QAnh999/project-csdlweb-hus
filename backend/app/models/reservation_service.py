from sqlalchemy import Column, Integer, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.database.base import Base

class ReservationService(Base):
    __tablename__ = "reservation_services"
    
    id = Column(Integer, primary_key=True, index=True)
    reservation_detail_id = Column(Integer, ForeignKey("reservation_details.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    
    reservation_detail = relationship("ReservationDetail", back_populates="reservation_services")
    service = relationship("Service", back_populates="reservation_services")