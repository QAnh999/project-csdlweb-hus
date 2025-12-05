from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class ReservationDetail(Base):
    __tablename__ = "reservation_details"
    
    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False)
    passenger_id = Column(Integer, ForeignKey("passengers.id"), nullable=False)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    seat_id = Column(Integer, ForeignKey("seats.id"), nullable=False)
    
    base_fare = Column(Numeric(10, 2), nullable=False)
    seat_surcharge = Column(Numeric(10, 2), default=0)
    luggage_surcharge = Column(Numeric(10, 2), default=0)
    tax_fare = Column(Numeric(10, 2), default=0)
    total_fare = Column(Numeric(10, 2), nullable=False)
    
    luggage_count = Column(Integer, default=0)
    luggage_weight = Column(Numeric(5, 2), default=0)
    
    checkin_time = Column(DateTime)
    checkin_method = Column(String(20), default='none')
    boarding_pass_code = Column(String(50), unique=True)
    checkin_status = Column(String(20), default='not_checked_in')
    
    reservation = relationship("Reservation", back_populates="reservation_details")
    passenger = relationship("Passenger", back_populates="reservation_details")
    flight = relationship("Flight", back_populates="reservation_details")
    seat = relationship("Seat", back_populates="reservation_details")
    tickets = relationship("Ticket", back_populates="reservation_detail")
    reservation_services = relationship("ReservationService", back_populates="reservation_detail")