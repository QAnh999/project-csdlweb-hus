from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.base import Base

class Airline(Base):
    __tablename__ = "airlines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    code = Column(String(10), nullable=False, unique=True)
    logo_url = Column(String(500))
    contact_email = Column(String(255))
    phone = Column(String(20))
    website = Column(String(255))
    
    aircrafts = relationship("Aircraft", back_populates="airline")
    flights = relationship("Flight", back_populates="airline")