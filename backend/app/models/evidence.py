import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class VerificationStatus(str, enum.Enum):
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class RepairEvidence(Base):
    __tablename__ = "repair_evidence"

    id = Column(Integer, primary_key=True, index=True)
    fault_report_id = Column(Integer, ForeignKey("fault_reports.id", ondelete="CASCADE"), nullable=False)
    
    # Photographic Proof of Work
    before_photo_url = Column(String(500), nullable=True)
    after_photo_url = Column(String(500), nullable=False)
    
    work_summary = Column(Text, nullable=False)
    parts_replaced = Column(String(500), nullable=True)
    repair_duration_hours = Column(Integer, default=1)
    
    # Verification Gate
    status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING_REVIEW, nullable=False)
    verified_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    verification_notes = Column(Text, nullable=True)
    
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    verified_at = Column(DateTime, nullable=True)

    # Relationships
    fault_report = relationship("FaultReport", back_populates="evidence")
    verified_by_user = relationship("User", back_populates="verified_repairs")

