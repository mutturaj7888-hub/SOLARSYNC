from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.evidence import VerificationStatus


class EvidenceCreate(BaseModel):
    fault_report_id: int
    before_photo_url: Optional[str] = None
    after_photo_url: str
    work_summary: str
    parts_replaced: Optional[str] = None
    repair_duration_hours: int = 1


class EvidenceVerify(BaseModel):
    approved: bool
    verification_notes: Optional[str] = None


class EvidenceOut(BaseModel):
    id: int
    fault_report_id: int
    before_photo_url: Optional[str] = None
    after_photo_url: str
    work_summary: str
    parts_replaced: Optional[str] = None
    repair_duration_hours: int
    status: VerificationStatus
    verified_by_id: Optional[int] = None
    verification_notes: Optional[str] = None
    submitted_at: datetime
    verified_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

