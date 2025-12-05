from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.promotion import Promotions
from app.schemas.promotions import PromotionCreate, PromotionUpdate

class PromotionRepository(BaseRepository[Promotions, PromotionCreate, PromotionUpdate]):

    def __init__(self):
        super().__init__(Promotions)

    def get_by_code(self, db: Session, code: str):
        return db.query(Promotions).filter(Promotions.code == code).first()


promotion_repository = PromotionRepository()
