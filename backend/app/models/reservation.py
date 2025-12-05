from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Reservation(Base):
    __tablename__ = "reservations"
    
    id = Column(Integer, primary_key=True, index=True)
    reservation_code = Column(String(20), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    main_flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    return_flight_id = Column(Integer, ForeignKey("flights.id"))
    
    total_passengers = Column(Integer, nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    paid_amount = Column(Numeric(12, 2), default=0)
    discount_amount = Column(Numeric(10, 2), default=0)
    tax_amount = Column(Numeric(10, 2), default=0)
    
    status = Column(String(50), default='pending')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime)
    
    user = relationship("User", back_populates="reservations")
    main_flight = relationship("Flight", foreign_keys=[main_flight_id], back_populates="main_reservations")
    return_flight = relationship("Flight", foreign_keys=[return_flight_id], back_populates="return_reservations")
    reservation_details = relationship("ReservationDetail", back_populates="reservation")
    payments = relationship("Payment", back_populates="reservation")
    invoices = relationship("Invoice", back_populates="reservation")
    booked_seats = relationship("BookedSeat", back_populates="reservation")