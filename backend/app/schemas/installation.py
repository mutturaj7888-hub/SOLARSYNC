from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.models.installation import InstallationType, OperationalStatus, EquipmentType


class EquipmentBase(BaseModel):
    equipment_type: EquipmentType
    manufacturer: str
    model_number: str
    serial_number: Optional[str] = None
    capacity_rating: Optional[str] = None
    warranty_expiry: Optional[datetime] = None
    status: str = "operational"


class EquipmentCreate(EquipmentBase):
    pass


class EquipmentOut(EquipmentBase):
    id: int
    installation_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InstallationBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    address: str
    city: str
    state: str
    postal_code: Optional[str] = None
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    capacity_kw: float = Field(..., gt=0.0)
    installation_type: InstallationType = InstallationType.ROOFTOP_RESIDENTIAL
    operational_status: OperationalStatus = OperationalStatus.OPERATIONAL
    commissioning_date: Optional[datetime] = None
    is_demo_data: bool = False


class InstallationCreate(InstallationBase):
    equipment: Optional[List[EquipmentCreate]] = None


class InstallationUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity_kw: Optional[float] = None
    installation_type: Optional[InstallationType] = None
    operational_status: Optional[OperationalStatus] = None


class InstallationOut(InstallationBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    equipment: List[EquipmentOut] = []
    distance_km: Optional[float] = None # Calculated dynamically for nearby queries

    model_config = ConfigDict(from_attributes=True)

