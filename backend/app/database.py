import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# Lấy chính xác từ environment variable trong docker-compose
DATABASE_URL = os.getenv("DATABASE_URL")

# Tạo engine Async
engine = create_async_engine(DATABASE_URL, echo=True)

# Tạo Session Async
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

# Dependency lấy DB (Async)
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()