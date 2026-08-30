from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def root():
    return {
        "message": "Udyam-Sarthi API is running",
        "status": "success",
    }


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
    }


@router.get("/api/info")
def api_info():
    return {
        "name": "Udyam-Sarthi",
        "version": "1.0.0",
        "description": "Backend API for Udyam-Sarthi",
    }