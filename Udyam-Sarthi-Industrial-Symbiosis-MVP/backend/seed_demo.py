from database import SessionLocal
from models import Supplier, Buyer


db = SessionLocal()

# Clear existing demo records
db.query(Supplier).delete()
db.query(Buyer).delete()


# =========================
# DEMO SUPPLIERS
# =========================

suppliers = [
    Supplier(
        name="EcoBuild Industries",
        industry="Construction",
        location="Mumbai",
        latitude=19.0760,
        longitude=72.8777,
        material="Fly Ash",
        quantity=5000,
        unit="kg/month",
        frequency="Monthly"
    ),

    Supplier(
        name="GreenForge Metals",
        industry="Metal Manufacturing",
        location="Thane",
        latitude=19.2183,
        longitude=72.9781,
        material="Steel Scrap",
        quantity=3000,
        unit="kg/month",
        frequency="Monthly"
    ),

    Supplier(
        name="Maharashtra Glass Works",
        industry="Glass Manufacturing",
        location="Navi Mumbai",
        latitude=19.0330,
        longitude=73.0297,
        material="Glass Scrap",
        quantity=2500,
        unit="kg/month",
        frequency="Monthly"
    ),

    Supplier(
        name="Sunrise Chemicals",
        industry="Chemical Manufacturing",
        location="Dombivli",
        latitude=19.2094,
        longitude=73.0939,
        material="Gypsum",
        quantity=4000,
        unit="kg/month",
        frequency="Weekly"
    ),

    Supplier(
        name="Mumbai Textile Works",
        industry="Textile",
        location="Bhiwandi",
        latitude=19.2813,
        longitude=73.0483,
        material="Textile Waste",
        quantity=2000,
        unit="kg/month",
        frequency="Monthly"
    ),
]


# =========================
# DEMO BUYERS
# =========================

buyers = [
    Buyer(
        name="Urban Cement Solutions",
        industry="Cement Manufacturing",
        location="Mumbai",
        latitude=19.0822,
        longitude=72.8811,
        material_needed="Fly Ash",
        quantity_needed=3000,
        unit="kg/month",
        frequency="Monthly"
    ),

    Buyer(
        name="ReMetal Industries",
        industry="Metal Recycling",
        location="Thane",
        latitude=19.2000,
        longitude=72.9700,
        material_needed="Steel Scrap",
        quantity_needed=2500,
        unit="kg/month",
        frequency="Monthly"
    ),

    Buyer(
        name="Crystal Recycle",
        industry="Glass Recycling",
        location="Navi Mumbai",
        latitude=19.0400,
        longitude=73.0200,
        material_needed="Glass Scrap",
        quantity_needed=2000,
        unit="kg/month",
        frequency="Monthly"
    ),

    Buyer(
        name="BuildMix Materials",
        industry="Construction Materials",
        location="Dombivli",
        latitude=19.2150,
        longitude=73.0900,
        material_needed="Gypsum",
        quantity_needed=3000,
        unit="kg/month",
        frequency="Weekly"
    ),

    Buyer(
        name="ReFiber Industries",
        industry="Recycling",
        location="Bhiwandi",
        latitude=19.2750,
        longitude=73.0550,
        material_needed="Textile Waste",
        quantity_needed=1500,
        unit="kg/month",
        frequency="Monthly"
    ),
]


# =========================
# ADD TO DATABASE
# =========================

db.add_all(suppliers)
db.add_all(buyers)

db.commit()

print("===================================")
print("Demo data restored successfully!")
print("===================================")
print(f"Suppliers added: {len(suppliers)}")
print(f"Buyers added: {len(buyers)}")
print("===================================")

db.close()