from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.maintenance import PriorityLevel, ScheduleFrequency, ScheduleStatus


class AssignmentCreate(BaseModel):
    fault_report_id: int
    technician_id: int
    priority: PriorityLevel = PriorityLevel.ROUTINE
    dispatch_notes: Optional[str] = None


class AssignmentStatusUpdate(BaseModel):
    status: str # "started", "completed"
    notes: Optional[str] = None


class AssignmentOut(BaseModel):
    id: int
    fault_report_id: int
    technician_id: int
    priority: PriorityLevel
    dispatch_notes: Optional[str] = None
    assigned_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    technician_name: Optional[str] = None
    ticket_number: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ScheduleCreate(BaseModel):
    installation_id: int
    title: str
    frequency: ScheduleFrequency = ScheduleFrequency.QUARTERLY
    scheduled_date: datetime
    checklist_template: Optional[str] = None


class ScheduleOut(BaseModel):
    id: int
    installation_id: int
    title: str
    frequency: ScheduleFrequency
    scheduled_date: datetime
    status: ScheduleStatus
    checklist_template: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

