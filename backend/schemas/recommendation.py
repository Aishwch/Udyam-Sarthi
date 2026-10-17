from typing import List, Optional
from pydantic import BaseModel, Field


class RecommendationInput(BaseModel):
    actual_output: float = Field(..., ge=0.0)
    expected_output: float = Field(..., ge=0.0)
    utilization_rate: float = Field(..., ge=0.0, le=100.0)
    efficiency_rate: float = Field(..., ge=0.0, le=200.0)
    downtime_hours: float = Field(..., ge=0.0)
    energy_per_unit: float = Field(..., ge=0.0)
    total_scrap_kg: float = Field(..., ge=0.0)
    industry: Optional[str] = Field("Manufacturing", max_length=100)


class RecommendationItem(BaseModel):
    id: str
    title: str
    priority: str  # High, Medium, Low
    category: str
    trigger_condition: str
    current_value: str
    benchmark_threshold: str
    why_it_matters: str
    suggested_action: str
    cta_route: str


class RecommendationResponse(BaseModel):
    total_recommendations: int
    recommendations: List[RecommendationItem]
