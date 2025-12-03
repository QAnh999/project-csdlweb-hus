from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Connection with database
DATABASE_URL = "postgresql://lotus_admin:LotusTravel2025@db:5432/lotus_db"
engine = create_engine(DATABASE_URL)

# Session to execute queries
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
