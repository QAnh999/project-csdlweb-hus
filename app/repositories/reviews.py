from app.repositories.base import BaseRepository
from app.models.review import Reviews
from app.schemas.reviews import ReviewCreate, ReviewUpdate

class ReviewRepository(BaseRepository[Reviews, ReviewCreate, ReviewUpdate]):

    def __init__(self):
        super().__init__(Reviews)


review_repository = ReviewRepository()
