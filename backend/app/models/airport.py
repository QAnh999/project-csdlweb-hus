# app/models/airport.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.base import Base

class Airport(Base):
    __tablename__ = "airports"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    iata = Column(String(3), unique=True, nullable=True)
    icao = Column(String(4), unique=True, nullable=True)
    
    def __repr__(self):
        return f"<Airport {self.iata or self.icao}: {self.name}>"