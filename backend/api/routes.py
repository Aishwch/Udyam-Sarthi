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