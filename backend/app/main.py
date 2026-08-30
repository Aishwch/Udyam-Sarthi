from fastapi import FastAPI

from api.routes import router
from app.database import Base, engine
from models.user import User

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Udyam-Sarthi API",
    description="Backend API for Udyam-Sarthi",
    version="1.0.0",
)

app.include_router(router)