from app.repositories.base import BaseRepository
from app.models.promotion_usage import PromotionUsage
from app.schemas.promotion_usage import PromotionUsageCreate, PromotionUsageUpdate

class PromotionUsageRepository(BaseRepository[PromotionUsage, PromotionUsageCreate, PromotionUsageUpdate]):

    def __init__(self):
        super().__init__(PromotionUsage)


promotion_usage_repository = PromotionUsageRepository()
