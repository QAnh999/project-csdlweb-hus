from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Sử dụng sync PostgreSQL connection
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://lotus_admin:LotusTravel2025@localhost:5432/lotus_db"
)

# Tạo engine sync
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)

# Tạo session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Tạo Base cho models
Base = declarative_base()

def get_db():
    """
    Dependency để lấy database session
    Sử dụng trong FastAPI dependencies
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Khởi tạo database (tạo tất cả tables)
    """
    Base.metadata.create_all(bind=engine)