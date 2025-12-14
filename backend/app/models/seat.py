from sqlalchemy import Column, Integer, String, Boolean, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Seat(Base):
    __tablename__ = "seats"
    
    id = Column(Integer, primary_key=True, index=True)
    id_aircraft = Column(Integer, ForeignKey("aircrafts.id"), nullable=False)
    seat_number = Column(String(10), nullable=False)
    seat_class = Column(String(20), nullable=False)
    seat_type = Column(String(50), nullable=False)
    is_available = Column(Boolean, default=True)
    price_surcharge = Column(Numeric(10,2), default=0)
    
    aircraft = relationship("Aircraft", back_populates="seats")
    reservation_details = relationship("ReservationDetail", back_populates="seat")
    booked_seats = relationship("BookedSeat", back_populates="seat")