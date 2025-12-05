from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(20), unique=True, nullable=False)
    reservation_detail_id = Column(Integer, ForeignKey("reservation_details.id"), nullable=False)
    issue_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default='active')
    qr_code_url = Column(String(255))
    pdf_url = Column(String(255))
    
    reservation_detail = relationship("ReservationDetail", back_populates="tickets")