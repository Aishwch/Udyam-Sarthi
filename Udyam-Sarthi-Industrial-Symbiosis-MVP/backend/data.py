from database import SessionLocal
from models import Supplier, Buyer


def seed_database():
    db = SessionLocal()

    # Prevent duplicate data
    if db.query(Supplier).count() > 0 or db.query(Buyer).count() > 0:
        print("Database already contains data.")
        db.close()
        return

    suppliers = [
        Supplier(
            name="GreenForge Industries",
            industry="Construction Materials",
            location="Mumbai",
            latitude=19.0760,
            longitude=72.8777,
            material="Fly Ash",
            quantity=2200,
            unit="kg/month",
            frequency="Monthly"
        ),
        Supplier(
            name="Coastal Foods Pvt Ltd",
            industry="Food Processing",
            location="Thane",
            latitude=19.2183,
            longitude=72.9781,
            material="Organic Waste",
            quantity=1800,
            unit="kg/month",
            frequency="Daily"
        ),
        Supplier(
            name="Metro Metal Works",
            industry="Metal Manufacturing",
            location="Navi Mumbai",
            latitude=19.0330,
            longitude=73.0297,
            material="Metal Scrap",
            quantity=950,
            unit="kg/month",
            frequency="Weekly"
        ),
        Supplier(
            name="Sunrise Textiles",
            industry="Textile Manufacturing",
            location="Bhiwandi",
            latitude=19.2813,
            longitude=73.0483,
            material="Textile Waste",
            quantity=1200,
            unit="kg/month",
            frequency="Weekly"
        )
    ]

    buyers = [
        Buyer(
            name="BuildCycle Materials",
            industry="Construction",
            location="Mumbai",
            latitude=19.0760,
            longitude=72.8777,
            material_needed="Fly Ash",
            quantity_needed=2000,
            unit="kg/month",
            frequency="Monthly"
        ),
        Buyer(
            name="BioEnergy Works",
            industry="Renewable Energy",
            location="Thane",
            latitude=19.2183,
            longitude=72.9781,
            material_needed="Organic Waste",
            quantity_needed=1500,
            unit="kg/month",
            frequency="Daily"
        ),
        Buyer(
            name="ReMetal Industries",
            industry="Metal Recycling",
            location="Navi Mumbai",
            latitude=19.0330,
            longitude=73.0297,
            material_needed="Metal Scrap",
            quantity_needed=800,
            unit="kg/month",
            frequency="Weekly"
        ),
        Buyer(
            name="EcoFiber Products",
            industry="Textile Recycling",
            location="Bhiwandi",
            latitude=19.2813,
            longitude=73.0483,
            material_needed="Textile Waste",
            quantity_needed=1000,
            unit="kg/month",
            frequency="Weekly"
        )
    ]

    db.add_all(suppliers)
    db.add_all(buyers)

    db.commit()
    db.close()

    print("Demo industrial data inserted successfully!")


if __name__ == "__main__":
    seed_database()