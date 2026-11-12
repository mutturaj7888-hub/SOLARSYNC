from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from app.core.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_name = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False) # e.g. "FAULT_REPORTED", "JOB_ASSIGNED", "REPAIR_VERIFIED"
    description = Column(Text, nullable=False)
    entity_type = Column(String(100), nullable=True) # "installation", "fault", "assignment"
    entity_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

