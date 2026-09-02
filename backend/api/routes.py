from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from schemas.user import UserCreate, UserResponse
from services.user_service import create_user, get_user, get_users

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


@router.post("/api/users", response_model=UserResponse)
def create_user_api(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    return create_user(db, user_data)


@router.get("/api/users", response_model=list[UserResponse])
def get_users_api(db: Session = Depends(get_db)):
    return get_users(db)


@router.get("/api/users/{user_id}", response_model=UserResponse)
def get_user_api(
    user_id: int,
    db: Session = Depends(get_db),
):
    user = get_user(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user