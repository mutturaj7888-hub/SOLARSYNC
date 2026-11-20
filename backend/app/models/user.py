import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserRole(str, enum.Enum):
    DISTRIBUTOR = "distributor"
    ADMIN = "admin"
    MAINTAINER = "maintainer"
    TECHNICIAN = "technician"
    INSTALLATION_OWNER = "installation_owner"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(50), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.INSTALLATION_OWNER, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Location columns for distributors, maintainers, and residents
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    city = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)

    # Relationships
    installations = relationship("SolarInstallation", back_populates="owner", cascade="all, delete-orphan")
    fault_reports = relationship("FaultReport", back_populates="reported_by")
    assigned_jobs = relationship("MaintenanceAssignment", back_populates="technician")
    verified_repairs = relationship("RepairEvidence", back_populates="verified_by_user")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

