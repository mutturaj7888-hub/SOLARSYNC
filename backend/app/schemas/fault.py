from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.fault import FaultCategory, FaultSeverity, FaultStatus


class FaultBase(BaseModel):
    title: str
    description: str
    category: FaultCategory = FaultCategory.OTHER
    severity: FaultSeverity = FaultSeverity.MEDIUM
    photo_url: Optional[str] = None


class FaultCreate(FaultBase):
    installation_id: int
    distributor_id: Optional[int] = None


class FaultUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[FaultCategory] = None
    severity: Optional[FaultSeverity] = None
    status: Optional[FaultStatus] = None
    photo_url: Optional[str] = None
    distributor_id: Optional[int] = None


class FaultOut(FaultBase):
    id: int
    ticket_number: str
    status: FaultStatus
    installation_id: int
    reported_by_id: int
    distributor_id: Optional[int] = None
    distributor_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    installation_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

