from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    airline_id = Column(Integer, ForeignKey("airlines.id"), nullable=False)

    rating_overall = Column(Integer, nullable=False)
    rating_comfort = Column(Integer)
    rating_service = Column(Integer)
    rating_punctuality = Column(Integer)

    comment_text = Column(Text)
    comment_date = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="reviews")
    flight = relationship("Flight", back_populates="reviews")
    airline = relationship("Airline", back_populates="reviews")
