from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Passenger(Base):
    __tablename__ = "passengers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(10))
    nationality = Column(String(100))
    passport_number = Column(String(50), unique=True)
    passport_expiry = Column(Date)
    identify_number = Column(String(50))
    passenger_type = Column(String(20), default='adult')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="passengers")
    reservation_details = relationship("ReservationDetail", back_populates="passenger")
    reservation_passenger = relationship("ReservationPassenger", back_populates="passenger")