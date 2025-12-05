from sqlalchemy import Column, Integer, DECIMAL, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class PromotionUsage(Base):
    __tablename__ = "promotion_usage"

    id = Column(Integer, primary_key=True, index=True)
    promotion_id = Column(Integer, ForeignKey("promotions.id"), nullable=False)
    reservation_id = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    discount_amount = Column(DECIMAL(10,2), nullable=False)
    used_at = Column(DateTime, default=datetime.utcnow)

    promotion = relationship("Promotion", back_populates="usages")
    user = relationship("User", back_populates="promotions_used")
