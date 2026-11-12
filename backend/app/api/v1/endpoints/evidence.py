from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.fault import FaultReport, FaultStatus
from app.models.installation import SolarInstallation, OperationalStatus
from app.models.evidence import RepairEvidence, VerificationStatus
from app.models.notification import Notification
from app.models.activity import ActivityLog
from app.schemas.evidence import EvidenceCreate, EvidenceVerify, EvidenceOut
from app.api.deps import get_current_user, require_roles

router = APIRouter()


@router.post("", response_model=EvidenceOut, summary="Submit Repair Proof & Evidence")
def submit_repair_evidence(
    evidence_in: EvidenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.TECHNICIAN, UserRole.ADMIN]))
):
    """
    Field technicians submit photographic proof (before/after images),
    work log summary, and parts replaced upon completing a repair.
    """
    fault = db.query(FaultReport).filter(FaultReport.id == evidence_in.fault_report_id).first()
    if not fault:
        raise HTTPException(status_code=404, detail="Fault report not found")

    evidence = RepairEvidence(
        fault_report_id=fault.id,
        before_photo_url=evidence_in.before_photo_url,
        after_photo_url=evidence_in.after_photo_url,
        work_summary=evidence_in.work_summary,
        parts_replaced=evidence_in.parts_replaced,
        repair_duration_hours=evidence_in.repair_duration_hours,
        status=VerificationStatus.PENDING_REVIEW
    )
    db.add(evidence)
    
    # Update fault status to await owner/admin sign-off
    fault.status = FaultStatus.RESOLVED_PENDING_VERIFICATION
    db.commit()
    db.refresh(evidence)

    # Notify installation owner that job is awaiting verification
    inst = fault.installation
    if inst and inst.owner_id:
        notif = Notification(
            user_id=inst.owner_id,
            title="Repair Completed — Sign-off Required",
            message=f"Technician submitted repair evidence for {fault.ticket_number} on '{inst.name}'. Please review and approve.",
            event_type="verification_needed",
            link_url=f"/maintenance?ticket={fault.ticket_number}"
        )
        db.add(notif)

    # Activity Log
    log = ActivityLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="EVIDENCE_SUBMITTED",
        description=f"Technician submitted repair photos for ticket {fault.ticket_number}",
        entity_type="fault",
        entity_id=fault.id
    )
    db.add(log)
    db.commit()

    return evidence


@router.post("/{evidence_id}/verify", response_model=EvidenceOut, summary="Verify & Sign-off or Reopen Repair")
def verify_repair(
    evidence_id: int,
    decision: EvidenceVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.INSTALLATION_OWNER, UserRole.ADMIN]))
):
    """
    Asset owner or Administrator inspects before/after photos:
    - Approved: Ticket marked VERIFIED_CLOSED, installation restored to OPERATIONAL.
    - Rejected: Ticket marked REJECTED_REOPENED, sent back to technician with notes.
    """
    evidence = db.query(RepairEvidence).filter(RepairEvidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Repair evidence not found")

    fault = evidence.fault_report
    now = datetime.now(timezone.utc)

    evidence.verified_by_id = current_user.id
    evidence.verified_at = now
    evidence.verification_notes = decision.verification_notes

    if decision.approved:
        evidence.status = VerificationStatus.APPROVED
        fault.status = FaultStatus.VERIFIED_CLOSED
        fault.resolved_at = now
        
        # Restore installation status if no other active faults
        inst = fault.installation
        if inst:
            remaining_faults = db.query(FaultReport).filter(
                FaultReport.installation_id == inst.id,
                FaultReport.status.notin_([FaultStatus.VERIFIED_CLOSED])
            ).count()
            if remaining_faults <= 1:
                inst.operational_status = OperationalStatus.OPERATIONAL

        action_msg = f"Ticket {fault.ticket_number} verified and closed successfully."
    else:
        evidence.status = VerificationStatus.REJECTED
        fault.status = FaultStatus.REJECTED_REOPENED
        action_msg = f"Ticket {fault.ticket_number} was rejected by owner. Reason: {decision.verification_notes}"

    # Log action
    log = ActivityLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="REPAIR_VERIFIED" if decision.approved else "REPAIR_REOPENED",
        description=action_msg,
        entity_type="fault",
        entity_id=fault.id
    )
    db.add(log)
    db.commit()
    db.refresh(evidence)

    return evidence


@router.get("/fault/{fault_id}", response_model=List[EvidenceOut], summary="Get Evidence for Fault Ticket")
def get_fault_evidence(fault_id: int, db: Session = Depends(get_db)):
    """Retrieve all evidence submissions associated with a fault ticket."""
    evidence_list = db.query(RepairEvidence).filter(RepairEvidence.fault_report_id == fault_id).all()
    return evidence_list

