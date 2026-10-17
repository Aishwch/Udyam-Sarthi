import sys
from pathlib import Path
from sqlalchemy.orm import Session

# Ensure MVP backend is in path for matching logic
MVP_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent / "Udyam-Sarthi-Industrial-Symbiosis-MVP" / "backend"
if str(MVP_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(MVP_BACKEND_DIR))

from matching import calculate_match
from models.symbiosis import Supplier, Buyer
from schemas.symbiosis import SupplierCreate, BuyerCreate, SymbiosisImpactSummary, MatchesResponse


def get_all_suppliers(db: Session):
    return db.query(Supplier).all()


def get_all_buyers(db: Session):
    return db.query(Buyer).all()


def create_new_supplier(db: Session, data: SupplierCreate):
    new_supplier = Supplier(
        name=data.name,
        industry=data.industry,
        location=data.location,
        latitude=data.latitude,
        longitude=data.longitude,
        material=data.material,
        material_specification=data.material_specification,
        quality_notes=data.quality_notes,
        quantity=data.quantity,
        unit=data.unit,
        frequency=data.frequency,
    )
    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)
    return new_supplier


def create_new_buyer(db: Session, data: BuyerCreate):
    new_buyer = Buyer(
        name=data.name,
        industry=data.industry,
        location=data.location,
        latitude=data.latitude,
        longitude=data.longitude,
        material_needed=data.material_needed,
        material_specification=data.material_specification,
        quality_notes=data.quality_notes,
        quantity_needed=data.quantity_needed,
        unit=data.unit,
        frequency=data.frequency,
    )
    db.add(new_buyer)
    db.commit()
    db.refresh(new_buyer)
    return new_buyer


def compute_symbiosis_matches(db: Session, min_score: float = 40.0) -> dict:
    suppliers = db.query(Supplier).all()
    buyers = db.query(Buyer).all()

    matches = []
    potential_volume_kg = 0.0

    for supplier in suppliers:
        for buyer in buyers:
            match = calculate_match(supplier, buyer)
            if match.get("match_score", 0) >= min_score:
                matches.append(match)
                # Compute potential exchange volume in kg
                s_qty = float(supplier.quantity or 0)
                b_qty = float(buyer.quantity_needed or 0)
                exchangeable = min(s_qty, b_qty)
                potential_volume_kg += exchangeable

    # Sort descending by match score
    matches.sort(key=lambda m: m.get("match_score", 0), reverse=True)

    avg_score = (
        round(sum(m.get("match_score", 0) for m in matches) / len(matches), 1)
        if matches
        else 0.0
    )

    impact_summary = {
        "total_potential_matches": len(matches),
        "total_suppliers": len(suppliers),
        "total_buyers": len(buyers),
        "potential_material_exchanged_kg": round(potential_volume_kg, 1),
        "estimated_waste_diverted_kg": round(potential_volume_kg, 1),
        "avg_match_score": avg_score,
        "disclaimer": "Potential impact calculated from matching registered by-product generation and secondary material demand. Realized impact requires executed physical exchange."
    }

    return {
        "total_matches": len(matches),
        "impact_summary": impact_summary,
        "matches": matches
    }
