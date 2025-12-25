from sqlalchemy import Column, Integer, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class BookedSeat(Base):
    __tablename__ = "booked_seats"
    
    id_seat = Column(Integer, ForeignKey("seats.id"), primary_key=True)
    id_flight = Column(Integer, ForeignKey("flights.id"), primary_key=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"))
    # status = Column(String(10), default='held')
    hold_expires = Column(DateTime, nullable=True)
    booked_at = Column(DateTime, default=datetime.utcnow)
    
    seat = relationship("Seat", back_populates="booked_seats")
    flight = relationship("Flight", back_populates="booked_seats")
    reservation = relationship("Reservation", back_populates="booked_seats")