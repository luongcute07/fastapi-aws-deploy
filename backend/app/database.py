import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# Fallback to SQLite if psycopg2 is missing
try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            DATABASE_URL, connect_args={"check_same_thread": False}
        )
    else:
        try:
            import psycopg2  # noqa: F401
            engine = create_engine(DATABASE_URL)
        except ImportError:
            DATABASE_URL = "sqlite:///./app.db"
            engine = create_engine(
                DATABASE_URL, connect_args={"check_same_thread": False}
            )
except Exception:
    DATABASE_URL = "sqlite:///./app.db"
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
