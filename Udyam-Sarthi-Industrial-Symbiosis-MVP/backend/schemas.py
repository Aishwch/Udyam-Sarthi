from typing import Optional
from pydantic import BaseModel


class SupplierCreate(BaseModel):

    name: str

    industry: str

    location: str

    latitude: float

    longitude: float

    material: str

    # NEW: optional material specification
    material_specification: Optional[str] = None

    # NEW: optional quality information
    quality_notes: Optional[str] = None

    quantity: float

    unit: str

    frequency: str


class BuyerCreate(BaseModel):

    name: str

    industry: str

    location: str

    latitude: float

    longitude: float

    material_needed: str

    # NEW: optional required specification
    material_specification: Optional[str] = None

    # NEW: optional quality requirement
    quality_notes: Optional[str] = None

    quantity_needed: float

    unit: str

    frequency: str