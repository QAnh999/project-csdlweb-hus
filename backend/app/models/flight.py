from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

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
    
    base_price_economy = Column(Numeric(12, 2), nullable=False)
    base_price_business = Column(Numeric(12, 2))
    base_price_first = Column(Numeric(12, 2))
    
    luggage_fee_per_kg = Column(Numeric(10, 2), default=0)
    free_luggage_weight = Column(Numeric(5, 2), default=20)
    overweight_fee_per_kg = Column(Numeric(10, 2), default=0)
    
    total_seats = Column(Integer, nullable=False)
    available_seats_economy = Column(Integer, nullable=False)
    available_seats_business = Column(Integer, default=0)
    available_seats_first = Column(Integer, default=0)
    
    status = Column(String(20), default='scheduled')
    gate = Column(String(10))
    terminal = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    airline = relationship("Airline", back_populates="flights")
    aircraft = relationship("Aircraft", back_populates="flights")
    departure_airport = relationship("Airport", foreign_keys=[dep_airport], back_populates="departure_flights")
    arrival_airport = relationship("Airport", foreign_keys=[arr_airport], back_populates="arrival_flights")
    
    main_reservations = relationship("Reservation", foreign_keys="Reservation.main_flight_id", back_populates="main_flight")
    return_reservations = relationship("Reservation", foreign_keys="Reservation.return_flight_id", back_populates="return_flight")
    reservation_details = relationship("ReservationDetail", back_populates="flight")
    booked_seats = relationship("BookedSeat", back_populates="flight")