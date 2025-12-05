from sqlalchemy import Column, Integer, Date, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class RouteStatistic(Base):
    __tablename__ = "route_statistics"

    id = Column(Integer, primary_key=True, index=True)
    dep_airport_id = Column(Integer, ForeignKey("airports.id"), nullable=False)
    arr_airport_id = Column(Integer, ForeignKey("airports.id"), nullable=False)
    statistic_date = Column(Date, nullable=False)

    total_passengers = Column(Integer, default=0)
    total_flights = Column(Integer, default=0)
    total_revenue = Column(DECIMAL(12,2), default=0)
    average_load_factor = Column(DECIMAL(5,2), default=0)

    dep_airport = relationship("Airport", foreign_keys=[dep_airport_id])
    arr_airport = relationship("Airport", foreign_keys=[arr_airport_id])
