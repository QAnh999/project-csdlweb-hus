# from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
# from sqlalchemy.orm import relationship
# from app.core.database import Base
# from datetime import datetime


# class HoldSeat(Base):
#     __tablename__ = "hold_seats"
    
#     id = Column(Integer, primary_key=True, index=True)
#     reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False)
#     flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
#     seat_id = Column(Integer, ForeignKey("seats.id"), nullable=False)
#     expire_at = Column(DateTime, nullable=False)
#     status = Column(String(20), default="held")
#     created_at = Column(DateTime, default=datetime.utcnow)
    
#     reservation = relationship("Reservation", back_populates="hold_seats")
#     flight = relationship("Flight")
#     seat = relationship("Seat")