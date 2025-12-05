from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class Airport(Base):
    __tablename__ = "airports"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    iata = Column(String(3), unique=True)
    icao = Column(String(4), unique=True)
    
    departure_flights = relationship("Flight", foreign_keys="Flight.dep_airport", back_populates="departure_airport")
    arrival_flights = relationship("Flight", foreign_keys="Flight.arr_airport", back_populates="arrival_airport")