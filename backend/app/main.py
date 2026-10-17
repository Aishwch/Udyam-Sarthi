import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from app.database import Base, engine
from models.user import User
from models.symbiosis import Supplier, Buyer

# Create tables if not present (does not drop or recreate existing data)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Udyam-Sarthi API",
    description="Backend API for Udyam-Sarthi: Digital Companion & Industrial Symbiosis Platform",
    version="1.0.0",
)

# CORS Middleware Configuration
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)