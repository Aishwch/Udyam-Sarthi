from sqlalchemy import Column, Integer, String, Float, Text
from database import Base


class Supplier(Base):

    __tablename__ = "suppliers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    industry = Column(
        String,
        nullable=False
    )

    location = Column(
        String,
        nullable=False
    )

    latitude = Column(
        Float,
        nullable=False
    )

    longitude = Column(
        Float,
        nullable=False
    )

    material = Column(
        String,
        nullable=False
    )

    # NEW: optional material specification
    material_specification = Column(
        String,
        nullable=True
    )

    # NEW: optional quality information
    quality_notes = Column(
        Text,
        nullable=True
    )

    quantity = Column(
        Float,
        nullable=False
    )

    unit = Column(
        String,
        nullable=False
    )

    frequency = Column(
        String,
        nullable=False
    )


class Buyer(Base):

    __tablename__ = "buyers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    industry = Column(
        String,
        nullable=False
    )

    location = Column(
        String,
        nullable=False
    )

    latitude = Column(
        Float,
        nullable=False
    )

    longitude = Column(
        Float,
        nullable=False
    )

    material_needed = Column(
        String,
        nullable=False
    )

    # NEW: optional required specification
    material_specification = Column(
        String,
        nullable=True
    )

    # NEW: optional quality requirement
    quality_notes = Column(
        Text,
        nullable=True
    )

    quantity_needed = Column(
        Float,
        nullable=False
    )

    unit = Column(
        String,
        nullable=False
    )

    frequency = Column(
        String,
        nullable=False
    )