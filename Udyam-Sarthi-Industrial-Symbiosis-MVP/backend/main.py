from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Supplier, Buyer
from schemas import SupplierCreate, BuyerCreate
from matching import calculate_match


app = FastAPI(
    title="Udyam Sarthi API",
    description="Industrial Symbiosis Recommendation Platform",
    version="1.0.0"
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# DATABASE CONNECTION
# ==================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==================================================
# HOME
# ==================================================

@app.get("/")
def home():

    return {
        "message": "Welcome to Udyam Sarthi API",
        "status": "running"
    }


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/api/health")
def health_check():

    return {
        "status": "healthy"
    }


# ==================================================
# GET SUPPLIERS
# ==================================================

@app.get("/api/suppliers")
def get_suppliers(
    db: Session = Depends(get_db)
):

    suppliers = db.query(Supplier).all()

    return suppliers


# ==================================================
# GET BUYERS
# ==================================================

@app.get("/api/buyers")
def get_buyers(
    db: Session = Depends(get_db)
):

    buyers = db.query(Buyer).all()

    return buyers


# ==================================================
# INDUSTRIAL SYMBIOSIS MATCHING
# ==================================================

@app.get("/api/matches")
def get_matches(
    db: Session = Depends(get_db)
):

    suppliers = db.query(Supplier).all()

    buyers = db.query(Buyer).all()

    matches = []

    # Compare every supplier with every buyer
    for supplier in suppliers:

        for buyer in buyers:

            match = calculate_match(
                supplier,
                buyer
            )

            # Only show meaningful matches
            if match["match_score"] >= 40:

                matches.append(match)

    # Highest score first
    matches.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return {
        "total_matches": len(matches),
        "matches": matches
    }


# ==================================================
# ADD NEW SUPPLIER
# ==================================================

@app.post("/api/suppliers")
def create_supplier(
    supplier: SupplierCreate,
    db: Session = Depends(get_db)
):

    new_supplier = Supplier(

        name=supplier.name,

        industry=supplier.industry,

        location=supplier.location,

        latitude=supplier.latitude,

        longitude=supplier.longitude,

        material=supplier.material,

        # NEW
        material_specification=
            supplier.material_specification,

        # NEW
        quality_notes=
            supplier.quality_notes,

        quantity=supplier.quantity,

        unit=supplier.unit,

        frequency=supplier.frequency

    )

    db.add(new_supplier)

    db.commit()

    db.refresh(new_supplier)

    return {

        "message":
            "Supplier added successfully",

        "supplier":
            new_supplier

    }


# ==================================================
# ADD NEW BUYER
# ==================================================

@app.post("/api/buyers")
def create_buyer(
    buyer: BuyerCreate,
    db: Session = Depends(get_db)
):

    new_buyer = Buyer(

        name=buyer.name,

        industry=buyer.industry,

        location=buyer.location,

        latitude=buyer.latitude,

        longitude=buyer.longitude,

        material_needed=
            buyer.material_needed,

        # NEW
        material_specification=
            buyer.material_specification,

        # NEW
        quality_notes=
            buyer.quality_notes,

        quantity_needed=
            buyer.quantity_needed,

        unit=buyer.unit,

        frequency=buyer.frequency

    )

    db.add(new_buyer)

    db.commit()

    db.refresh(new_buyer)

    return {

        "message":
            "Buyer added successfully",

        "buyer":
            new_buyer

    }