# app/models/airline.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.base import Base

class Airline(Base):
    __tablename__ = "airlines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    code = Column(String(10), nullable=False, unique=True)
    logo_url = Column(String(500), nullable=True)
    contact_email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    website = Column(String(255), nullable=True)
    
    # Relationships
    flights = relationship("Flight", back_populates="airline")
    aircrafts = relationship("Aircraft", back_populates="airline")
    
    def __repr__(self):
        return f"<Airline {self.code}: {self.name}>"