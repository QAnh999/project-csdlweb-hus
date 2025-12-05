from sqlalchemy import Column, Integer, Date, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class FlightStatistic(Base):
    __tablename__ = "flight_statistics"

    id = Column(Integer, primary_key=True, index=True)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    statistic_date = Column(Date, nullable=False)

    total_bookings = Column(Integer, default=0)
    total_revenue = Column(DECIMAL(12,2), default=0)
    occupancy_rate = Column(DECIMAL(5,2), default=0)
    avg_ticket_price = Column(DECIMAL(10,2), default=0)

    flight = relationship("Flight", back_populates="statistics")
