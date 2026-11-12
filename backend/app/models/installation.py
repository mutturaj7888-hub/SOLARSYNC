import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class InstallationType(str, enum.Enum):
    ROOFTOP_RESIDENTIAL = "rooftop_residential"
    ROOFTOP_COMMERCIAL = "rooftop_commercial"
    GROUND_MOUNTED = "ground_mounted"
    SOLAR_CARPORT = "solar_carport"


class OperationalStatus(str, enum.Enum):
    OPERATIONAL = "operational"
    UNDER_MAINTENANCE = "under_maintenance"
    INACTIVE = "inactive"
    DEGRADED = "degraded"


class SolarInstallation(Base):
    __tablename__ = "solar_installations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=True)
    
    # Coordinates for Geospatial PostGIS & haversine indexing
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)

    capacity_kw = Column(Float, nullable=False)
    installation_type = Column(Enum(InstallationType), default=InstallationType.ROOFTOP_RESIDENTIAL, nullable=False)
    operational_status = Column(Enum(OperationalStatus), default=OperationalStatus.OPERATIONAL, nullable=False, index=True)
    commissioning_date = Column(DateTime, nullable=True)
    is_demo_data = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Foreign Keys
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="installations")
    equipment = relationship("Equipment", back_populates="installation", cascade="all, delete-orphan")
    fault_reports = relationship("FaultReport", back_populates="installation", cascade="all, delete-orphan")
    schedules = relationship("MaintenanceSchedule", back_populates="installation", cascade="all, delete-orphan")


class EquipmentType(str, enum.Enum):
    INVERTER = "inverter"
    SOLAR_PANEL = "solar_panel"
    BATTERY_STORAGE = "battery_storage"
    CHARGE_CONTROLLER = "charge_controller"
    BI_DIRECTIONAL_METER = "bi_directional_meter"


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    installation_id = Column(Integer, ForeignKey("solar_installations.id", ondelete="CASCADE"), nullable=False)
    equipment_type = Column(Enum(EquipmentType), nullable=False)
    manufacturer = Column(String(150), nullable=False)
    model_number = Column(String(150), nullable=False)
    serial_number = Column(String(150), unique=True, index=True, nullable=True)
    capacity_rating = Column(String(50), nullable=True) # e.g. "10 kW" or "540 W"
    warranty_expiry = Column(DateTime, nullable=True)
    status = Column(String(50), default="operational")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    installation = relationship("SolarInstallation", back_populates="equipment")

