from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from schemas.user import UserCreate, UserResponse
from schemas.symbiosis import (
    SupplierCreate,
    SupplierResponse,
    BuyerCreate,
    BuyerResponse,
    MatchesResponse
)
from schemas.prediction import (
    ProductionPredictionRequest,
    ProductionPredictionResponse
)
from schemas.recommendation import (
    RecommendationInput,
    RecommendationResponse
)
from services.user_service import create_user, get_user, get_users
from services.symbiosis_service import (
    get_all_suppliers,
    get_all_buyers,
    create_new_supplier,
    create_new_buyer,
    compute_symbiosis_matches
)
from services.prediction_service import predict_production
from services.recommendation_service import generate_data_driven_recommendations

router = APIRouter()


# ==================================================
# SYSTEM & HEALTH
# ==================================================

@router.get("/")
def root():
    return {
        "message": "Udyam-Sarthi API is running",
        "status": "success",
    }


@router.get("/health")
@router.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Udyam-Sarthi API",
        "version": "1.0.0"
    }


@router.get("/api/info")
def api_info():
    return {
        "name": "Udyam-Sarthi",
        "version": "1.0.0",
        "description": "Backend API for Udyam-Sarthi MSME Digital Companion & Industrial Symbiosis",
        "modules": [
            "Industrial Symbiosis Resource Matching",
            "Data-Driven Business Recommendations",
            "ML Production Forecasting",
            "Plant Operations Analytics"
        ]
    }


# ==================================================
# INDUSTRIAL SYMBIOSIS: SUPPLIERS
# ==================================================

@router.get("/api/suppliers", response_model=list[SupplierResponse])
def get_suppliers_api(db: Session = Depends(get_db)):
    return get_all_suppliers(db)


@router.post("/api/suppliers", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier_api(
    supplier_data: SupplierCreate,
    db: Session = Depends(get_db),
):
    try:
        return create_new_supplier(db, supplier_data)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create supplier: {str(e)}"
        )


# ==================================================
# INDUSTRIAL SYMBIOSIS: BUYERS
# ==================================================

@router.get("/api/buyers", response_model=list[BuyerResponse])
def get_buyers_api(db: Session = Depends(get_db)):
    return get_all_buyers(db)


@router.post("/api/buyers", response_model=BuyerResponse, status_code=status.HTTP_201_CREATED)
def create_buyer_api(
    buyer_data: BuyerCreate,
    db: Session = Depends(get_db),
):
    try:
        return create_new_buyer(db, buyer_data)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create buyer: {str(e)}"
        )


# ==================================================
# INDUSTRIAL SYMBIOSIS: RESOURCE MATCHING & IMPACT
# ==================================================

@router.get("/api/matches", response_model=MatchesResponse)
def get_matches_api(
    min_score: float = Query(40.0, ge=0.0, le=100.0, description="Minimum compatibility match score"),
    db: Session = Depends(get_db)
):
    try:
        return compute_symbiosis_matches(db, min_score=min_score)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error computing symbiosis matches: {str(e)}"
        )


# ==================================================
# DATA-DRIVEN BUSINESS RECOMMENDATIONS
# ==================================================

@router.get("/api/recommendations", response_model=RecommendationResponse)
def get_default_recommendations_api():
    """Returns explainable recommendations for baseline MSME plant metrics."""
    default_input = RecommendationInput(
        actual_output=2280.0,
        expected_output=2450.0,
        utilization_rate=80.4,
        efficiency_rate=83.1,
        downtime_hours=3.5,
        energy_per_unit=3.62,
        total_scrap_kg=27.5,
        industry="Powder Coating / Metal Finishing"
    )
    recs = generate_data_driven_recommendations(default_input)
    return {
        "total_recommendations": len(recs),
        "recommendations": recs
    }


@router.post("/api/recommendations", response_model=RecommendationResponse)
def post_custom_recommendations_api(data: RecommendationInput):
    """Evaluates passed operational KPIs and returns explainable recommendations."""
    recs = generate_data_driven_recommendations(data)
    return {
        "total_recommendations": len(recs),
        "recommendations": recs
    }


# ==================================================
# ML PRODUCTION FORECASTING
# ==================================================

@router.post("/api/predict/production", response_model=ProductionPredictionResponse)
def predict_production_api(data: ProductionPredictionRequest):
    """Calculates production forecast using verified ML model pipeline and features."""
    try:
        return predict_production(data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Production prediction calculation error: {str(e)}"
        )


# ==================================================
# USER MANAGEMENT (PRESERVED)
# ==================================================

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