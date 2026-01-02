import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Sử dụng postgresql:// (Sync)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://lotus_admin:LotusTravel2025@db:5432/lotus_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()