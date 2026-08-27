from fastapi import FastAPI

from api.routes import router

app = FastAPI(
    title="Udyam-Sarthi API",
    description="Backend API for Udyam-Sarthi",
    version="1.0.0",
)

app.include_router(router)