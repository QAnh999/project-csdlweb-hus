from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class Aircraft(Base):
    __tablename__ = "aircrafts"

    id = Column(Integer, primary_key=True, index=True)
    model = Column(String(100), nullable=False)
    manufacturer = Column(String(100), nullable=True)
    capacity_economy = Column(Integer, nullable=False)
    capacity_business = Column(Integer, default=0)
    capacity_first = Column(Integer, default=0)

    airline_id = Column(
        Integer,
        ForeignKey("airlines.id"),
        nullable=False
    )

    airline = relationship("Airline", back_populates="aircrafts")
    flights = relationship("Flight", back_populates="aircraft")

    def __repr__(self):
        return f"<Aircraft {self.model}>"
