from fastapi import FastAPI

app = FastAPI(
    title="Udyam-Sarthi API",
    description="Backend API for Udyam-Sarthi",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "Udyam-Sarthi API is running",
        "status": "success",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }