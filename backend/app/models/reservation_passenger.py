from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class ReservationPassenger(Base):
    __tablename__ = "reservation_passengers"
    
    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False)
    passenger_id = Column(Integer, ForeignKey("passengers.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    reservation = relationship("Reservation", back_populates="reservation_passengers")
    passenger = relationship("Passenger", back_populates="reservation_passenger")



