from sqlalchemy import Column, Integer, String, Float, Text
from app.database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    material = Column(String, nullable=False)
    material_specification = Column(String, nullable=True)
    quality_notes = Column(Text, nullable=True)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    frequency = Column(String, nullable=False)


class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    material_needed = Column(String, nullable=False)
    material_specification = Column(String, nullable=True)
    quality_notes = Column(Text, nullable=True)
    quantity_needed = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    frequency = Column(String, nullable=False)
