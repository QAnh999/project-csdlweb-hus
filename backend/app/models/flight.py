# app/models/flight.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, DECIMAL, TIMESTAMP, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class Flight(Base):
    __tablename__ = "flights"
    
    id = Column(Integer, primary_key=True, index=True)
    flight_number = Column(String(20), nullable=False)
    id_airline = Column(Integer, ForeignKey("airlines.id"), nullable=False)
    id_aircraft = Column(Integer, ForeignKey("aircrafts.id"), nullable=False)
    dep_airport = Column(Integer, ForeignKey("airports.id"), nullable=False)
    arr_airport = Column(Integer, ForeignKey("airports.id"), nullable=False)
    dep_datetime = Column(DateTime, nullable=False)
    arr_datetime = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    
    # Prices
    base_price_economy = Column(DECIMAL(12, 2), nullable=False)
    base_price_business = Column(DECIMAL(12, 2), nullable=True)
    base_price_first = Column(DECIMAL(12, 2), nullable=True)
    
    # Luggage
    luggage_fee_per_kg = Column(DECIMAL(10, 2), default=0)
    free_luggage_weight = Column(DECIMAL(5, 2), default=20)
    overweight_fee_per_kg = Column(DECIMAL(10, 2), default=0)
    
    # Seats
    total_seats = Column(Integer, nullable=False)
    available_seats_economy = Column(Integer, nullable=False)
    available_seats_business = Column(Integer, default=0)
    available_seats_first = Column(Integer, default=0)
    
    # Status and info
    status = Column(String(20), default='scheduled')
    gate = Column(String(10), nullable=True)
    terminal = Column(String(10), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    airline = relationship("Airline", back_populates="flights")
    aircraft = relationship("Aircraft", back_populates="flights")
    departure_airport = relationship("Airport", foreign_keys=[dep_airport])
    arrival_airport = relationship("Airport", foreign_keys=[arr_airport])
    
    __table_args__ = (
        CheckConstraint('arr_datetime > dep_datetime', name='chk_valid_dates'),
    )
    
    def __repr__(self):
        return f"<Flight {self.flight_number} ({self.status})>"