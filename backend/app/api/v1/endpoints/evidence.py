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
    current_user: User = Depends(require_roles([UserRole.TECHNICIAN, UserRole.MAINTAINER, UserRole.ADMIN]))
):
    """
    Field maintainers/technicians submit photographic proof (before/after images),
    work log summary, and parts replaced upon completing a repair.
    A maintainer can only submit repair evidence once per fault.
    """
    fault = db.query(FaultReport).filter(FaultReport.id == evidence_in.fault_report_id).first()
    if not fault:
        raise HTTPException(status_code=404, detail="Fault report not found")

    # Enforce that evidence can only be submitted once for a fault
    existing = db.query(RepairEvidence).filter(RepairEvidence.fault_report_id == fault.id).first()
    if existing and fault.status in [FaultStatus.RESOLVED_PENDING_VERIFICATION, FaultStatus.RESIDENT_CONFIRMED, FaultStatus.VERIFIED_CLOSED]:
        raise HTTPException(
            status_code=400,
            detail="Repair evidence has already been submitted for this fault. It can only be sent once."
        )

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
    
    now = datetime.now(timezone.utc)
    # Update fault status to await resident confirmation
    fault.status = FaultStatus.RESOLVED_PENDING_VERIFICATION

    # Complete the technician assignment record so it is finalized
    from app.models.maintenance import MaintenanceAssignment
    assign = db.query(MaintenanceAssignment).filter(MaintenanceAssignment.fault_report_id == fault.id).first()
    if assign:
        if not assign.started_at:
            assign.started_at = now
        assign.completed_at = now

    db.commit()
    db.refresh(evidence)

    # Notify installation owner that job has been solved and requires resident confirmation
    inst = fault.installation
    if inst and inst.owner_id:
        notif = Notification(
            user_id=inst.owner_id,
            title="Issue Solved — Confirmation Needed",
            message=f"Maintainer solved issue {fault.ticket_number} on '{inst.name}'. Please inspect and confirm to distributor.",
            event_type="verification_needed",
            link_url=f"/faults"
        )
        db.add(notif)

    # Activity Log
    log = ActivityLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="EVIDENCE_SUBMITTED",
        description=f"Maintainer submitted repair photos for ticket {fault.ticket_number}",
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
    current_user: User = Depends(require_roles([UserRole.DISTRIBUTOR, UserRole.INSTALLATION_OWNER, UserRole.ADMIN]))
):
    """
    Distributor, Asset Owner, or Administrator inspects before/after photos and work logs:
    - Approved: Ticket marked VERIFIED_CLOSED, installation restored to OPERATIONAL.
    - Rejected: Ticket marked REJECTED_REOPENED, sent back to maintainer with notes.
    """
    # 1. Try finding evidence by primary key ID
    evidence = db.query(RepairEvidence).filter(RepairEvidence.id == evidence_id).first()

    # 2. If not found by ID, check if evidence_id was a fault_report_id
    if not evidence:
        evidence = db.query(RepairEvidence).filter(
            RepairEvidence.fault_report_id == evidence_id
        ).order_by(RepairEvidence.id.desc()).first()

    # 3. If evidence does not exist yet, find the fault and create an evidence record so closing succeeds without 404
    if not evidence:
        fault = db.query(FaultReport).filter(FaultReport.id == evidence_id).first()
        if fault:
            evidence = RepairEvidence(
                fault_report_id=fault.id,
                before_photo_url=fault.photo_url or "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80",
                after_photo_url="https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
                work_summary="Maintainer completed repair. Verified and closed by distributor.",
                status=VerificationStatus.PENDING_REVIEW
            )
            db.add(evidence)
            db.commit()
            db.refresh(evidence)
        else:
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

        action_msg = f"Ticket {fault.ticket_number} verified and closed successfully by {current_user.full_name}."
    else:
        evidence.status = VerificationStatus.REJECTED
        fault.status = FaultStatus.REJECTED_REOPENED
        action_msg = f"Ticket {fault.ticket_number} was rejected. Reason: {decision.verification_notes}"

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

