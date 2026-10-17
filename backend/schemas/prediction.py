from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class ProductionPredictionRequest(BaseModel):
    runtime: float = Field(..., ge=0.1, le=24.0, description="Operating runtime hours in shift")
    downtime: float = Field(..., ge=0.0, le=24.0, description="Unplanned downtime hours in shift")
    expected_output: float = Field(..., gt=0.0, le=50000.0, description="Expected production units based on rated capacity")
    energy_kwh: float = Field(..., ge=0.0, le=50000.0, description="Total energy consumed in kWh")
    scrap_units: float = Field(..., ge=0.0, le=10000.0, description="Scrap or rejected units recorded")
    machine_id: Optional[str] = Field(None, max_length=50, description="Optional machine identifier")


class ProductionPredictionResponse(BaseModel):
    predicted_output: float
    expected_output: float
    variance_units: float
    variance_percent: float
    model_used: str
    confidence_score: float
    evaluation_metrics: Dict[str, Any]
    features_used: List[str]
    forecast_period: str
    provenance: str = "ML Model (Trained on Udyam Sarathi Operations Dataset)"
