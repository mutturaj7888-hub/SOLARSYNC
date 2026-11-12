import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class PriorityLevel(str, enum.Enum):
    ROUTINE = "routine"
    EXPEDITED = "expedited"
    EMERGENCY = "emergency"


class MaintenanceAssignment(Base):
    __tablename__ = "maintenance_assignments"

    id = Column(Integer, primary_key=True, index=True)
    fault_report_id = Column(Integer, ForeignKey("fault_reports.id", ondelete="CASCADE"), unique=True, nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    priority = Column(Enum(PriorityLevel), default=PriorityLevel.ROUTINE, nullable=False)
    dispatch_notes = Column(Text, nullable=True)
    assigned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    fault_report = relationship("FaultReport", back_populates="assignment")
    technician = relationship("User", back_populates="assigned_jobs")


class ScheduleFrequency(str, enum.Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    SEMI_ANNUAL = "semi_annual"
    ANNUAL = "annual"


class ScheduleStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    OVERDUE = "overdue"


class MaintenanceSchedule(Base):
    __tablename__ = "maintenance_schedules"

    id = Column(Integer, primary_key=True, index=True)
    installation_id = Column(Integer, ForeignKey("solar_installations.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    frequency = Column(Enum(ScheduleFrequency), default=ScheduleFrequency.QUARTERLY, nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    status = Column(Enum(ScheduleStatus), default=ScheduleStatus.PENDING, nullable=False)
    checklist_template = Column(Text, nullable=True) # JSON or markdown checklist
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    installation = relationship("SolarInstallation", back_populates="schedules")

