import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MVP_DB = BASE_DIR / "Udyam-Sarthi-Industrial-Symbiosis-MVP" / "backend" / "udyam_sarthi.db"

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    if MVP_DB.exists():
        DATABASE_URL = f"sqlite:///{MVP_DB.as_posix()}"
    else:
        DATABASE_URL = "sqlite:///./udyam_sarthi.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()