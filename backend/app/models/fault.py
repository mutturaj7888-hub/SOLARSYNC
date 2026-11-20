import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class FaultCategory(str, enum.Enum):
    INVERTER_FAILURE = "inverter_failure"
    PANEL_DAMAGE = "panel_damage"
    SHADING_SOILING = "shading_soiling"
    WIRING_GROUND_FAULT = "wiring_ground_fault"
    GRID_TRIPPING = "grid_tripping"
    SENSOR_TELEMETRY = "sensor_telemetry"
    BATTERY_DEGRADATION = "battery_degradation"
    OTHER = "other"


class FaultSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class FaultStatus(str, enum.Enum):
    REPORTED = "reported"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED_PENDING_VERIFICATION = "resolved_pending_verification"
    RESIDENT_CONFIRMED = "resident_confirmed"
    VERIFIED_CLOSED = "verified_closed"
    REJECTED_REOPENED = "rejected_reopened"


class FaultReport(Base):
    __tablename__ = "fault_reports"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(FaultCategory), default=FaultCategory.OTHER, nullable=False)
    severity = Column(Enum(FaultSeverity), default=FaultSeverity.MEDIUM, nullable=False)
    status = Column(Enum(FaultStatus), default=FaultStatus.REPORTED, nullable=False, index=True)
    photo_url = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)

    # Foreign Keys
    installation_id = Column(Integer, ForeignKey("solar_installations.id", ondelete="CASCADE"), nullable=False)
    reported_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    installation = relationship("SolarInstallation", back_populates="fault_reports")
    reported_by = relationship("User", back_populates="fault_reports")
    assignment = relationship("MaintenanceAssignment", back_populates="fault_report", uselist=False, cascade="all, delete-orphan")
    evidence = relationship("RepairEvidence", back_populates="fault_report", cascade="all, delete-orphan")

