from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.user import UserRole


class UserBase(BaseModel):
    email: Optional[str] = None
    full_name: str
    phone_number: Optional[str] = None
    role: UserRole = UserRole.INSTALLATION_OWNER
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city: Optional[str] = None
    address: Optional[str] = None


class UserCreate(BaseModel):
    # Accepts name / username / email interchangeably
    name: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    password: str
    phone_number: Optional[str] = None
    role: Optional[UserRole] = UserRole.INSTALLATION_OWNER
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city: Optional[str] = None
    address: Optional[str] = None


class UserLogin(BaseModel):
    # Accepts name, username, or email
    username_or_email: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    name: Optional[str] = None
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    phone_number: Optional[str] = None
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city: Optional[str] = None
    address: Optional[str] = None
    distance_km: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
