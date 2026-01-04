from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, configure_mappers
from core.config import settings


engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    import app.models

    configure_mappers()

    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
