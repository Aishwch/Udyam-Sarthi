from typing import Optional, List
from pydantic import BaseModel, Field


class SupplierCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Company/Supplier Name")
    industry: str = Field(..., min_length=2, max_length=100, description="Industry Category")
    location: str = Field(..., min_length=2, max_length=150, description="City/Location")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude coordinate")
    material: str = Field(..., min_length=2, max_length=100, description="Material offered")
    material_specification: Optional[str] = Field(None, max_length=255)
    quality_notes: Optional[str] = Field(None, max_length=500)
    quantity: float = Field(..., gt=0.0, description="Material quantity generated")
    unit: str = Field(default="kg/month", max_length=50)
    frequency: str = Field(default="Monthly", max_length=50)


class SupplierResponse(SupplierCreate):
    id: int

    class Config:
        from_attributes = True


class BuyerCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Company/Buyer Name")
    industry: str = Field(..., min_length=2, max_length=100, description="Industry Category")
    location: str = Field(..., min_length=2, max_length=150, description="City/Location")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude coordinate")
    material_needed: str = Field(..., min_length=2, max_length=100, description="Material needed")
    material_specification: Optional[str] = Field(None, max_length=255)
    quality_notes: Optional[str] = Field(None, max_length=500)
    quantity_needed: float = Field(..., gt=0.0, description="Material quantity demanded")
    unit: str = Field(default="kg/month", max_length=50)
    frequency: str = Field(default="Monthly", max_length=50)


class BuyerResponse(BuyerCreate):
    id: int

    class Config:
        from_attributes = True


class SymbiosisImpactSummary(BaseModel):
    total_potential_matches: int
    total_suppliers: int
    total_buyers: int
    potential_material_exchanged_kg: float
    estimated_waste_diverted_kg: float
    avg_match_score: float
    disclaimer: str = "Estimates reflect potential symbiotic exchanges based on registered network listings. Real-world diversion requires verified transaction completion."


class MatchRecord(BaseModel):
    supplier_id: int
    supplier_name: str
    supplier_location: str
    supplier_industry: str
    supplier_quantity: float
    supplier_unit: str
    supplier_frequency: str
    buyer_id: int
    buyer_name: str
    buyer_location: str
    buyer_industry: str
    buyer_quantity_needed: float
    buyer_unit: str
    buyer_frequency: str
    material: str
    buyer_material_needed: str
    normalized_material: str
    distance_km: float
    match_score: float
    material_score: float
    quantity_score: float
    distance_score: float
    frequency_score: float
    industry_score: float
    compatibility_reason: str


class MatchesResponse(BaseModel):
    total_matches: int
    impact_summary: SymbiosisImpactSummary
    matches: List[MatchRecord]
