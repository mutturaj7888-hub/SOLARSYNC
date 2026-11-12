import os
import uuid
import shutil
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.installation import SolarInstallation, OperationalStatus
from app.models.fault import FaultReport, FaultStatus, FaultCategory, FaultSeverity
from app.models.activity import ActivityLog
from app.models.notification import Notification
from app.schemas.fault import FaultCreate, FaultUpdate, FaultOut
from app.api.deps import get_current_user

router = APIRouter()

ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024  # bytes


@router.get("", response_model=List[FaultOut], summary="List Fault Reports")
def get_fault_reports(
    installation_id: Optional[int] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve fault reports based on user permissions and filters."""
    query = db.query(FaultReport)
    
    # Non-admins and non-technicians see faults only for their installations
    if current_user.role == UserRole.INSTALLATION_OWNER:
        user_inst_ids = [i.id for i in current_user.installations]
        query = query.filter(FaultReport.installation_id.in_(user_inst_ids))

    if installation_id:
        query = query.filter(FaultReport.installation_id == installation_id)
    if status and status != "all":
        query = query.filter(FaultReport.status == status)
    if severity and severity != "all":
        query = query.filter(FaultReport.severity == severity)

    faults = query.order_by(FaultReport.created_at.desc()).offset(skip).limit(limit).all()
    
    # Decorate with installation names
    results = []
    for f in faults:
        out = FaultOut.model_validate(f)
        if f.installation:
            out.installation_name = f.installation.name
        results.append(out)
    return results


@router.get("/{fault_id}", response_model=FaultOut, summary="Get Fault Report Details")
def get_fault_report(fault_id: int, db: Session = Depends(get_db)):
    """Fetch complete ticket details."""
    fault = db.query(FaultReport).filter(FaultReport.id == fault_id).first()
    if not fault:
        raise HTTPException(status_code=404, detail="Fault report not found")
    out = FaultOut.model_validate(fault)
    if fault.installation:
        out.installation_name = fault.installation.name
    return out


@router.post("", response_model=FaultOut, summary="Submit New Fault Report")
def create_fault_report(
    fault_in: FaultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Report an inverter fault, panel damage, or power drop with optional photo."""
    inst = db.query(SolarInstallation).filter(SolarInstallation.id == fault_in.installation_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Solar installation not found")

    # Generate unique ticket reference
    ticket_num = f"FLT-{uuid.uuid4().hex[:6].upper()}"

    fault = FaultReport(
        ticket_number=ticket_num,
        title=fault_in.title,
        description=fault_in.description,
        category=fault_in.category,
        severity=fault_in.severity,
        status=FaultStatus.REPORTED,
        photo_url=fault_in.photo_url,
        installation_id=fault_in.installation_id,
        reported_by_id=current_user.id
    )
    db.add(fault)
    
    # Mark installation as under_maintenance or degraded if severe
    if fault_in.severity in [FaultSeverity.HIGH, FaultSeverity.CRITICAL]:
        inst.operational_status = OperationalStatus.UNDER_MAINTENANCE

    db.commit()
    db.refresh(fault)

    # Activity Log
    log = ActivityLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="FAULT_REPORTED",
        description=f"Ticket {ticket_num}: {fault.title} reported on '{inst.name}'",
        entity_type="fault",
        entity_id=fault.id
    )
    db.add(log)
    db.commit()

    out = FaultOut.model_validate(fault)
    out.installation_name = inst.name
    return out


@router.post("/upload-photo", summary="Upload Fault or Repair Evidence Photograph")
async def upload_photo(file: UploadFile = File(...)):
    """
    Validates file MIME type and size, then saves to secure uploads directory.
    Returns relative public URL path.
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{file.content_type}'. Allowed types: JPG, PNG, WebP"
        )

    # Generate secure random filename
    ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "status": "success",
        "filename": safe_filename,
        "url": f"/uploads/{safe_filename}"
    }


@router.post("/repair-all", summary="Repair and Verify All Open Faults")
def repair_all_faults(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Instantly marks all open fault reports as VERIFIED_CLOSED,
    records resolution timestamp, restores affected installations to OPERATIONAL,
    and commits activity logs.
    """
    open_faults = db.query(FaultReport).filter(
        FaultReport.status.notin_([FaultStatus.VERIFIED_CLOSED])
    ).all()
    
    now = datetime.now(timezone.utc)
    repaired_count = len(open_faults)
    
    for f in open_faults:
        f.status = FaultStatus.VERIFIED_CLOSED
        f.resolved_at = now
        if f.installation:
            f.installation.operational_status = OperationalStatus.OPERATIONAL

    db.commit()

    log = ActivityLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="BATCH_FAULTS_REPAIRED",
        description=f"Repaired and verified all {repaired_count} active solar fault tickets across grid.",
        entity_type="fault_batch",
        entity_id=0
    )
    db.add(log)
    db.commit()

    return {
        "status": "success",
        "message": f"Successfully repaired and verified {repaired_count} solar faults. Grid status restored to OPERATIONAL.",
        "repaired_count": repaired_count
    }


@router.put("/{fault_id}/status", response_model=FaultOut, summary="Update Fault Status")
def update_fault_status(
    fault_id: int,
    status_update: FaultUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates the status of a maintenance ticket."""
    fault = db.query(FaultReport).filter(FaultReport.id == fault_id).first()
    if not fault:
        raise HTTPException(status_code=404, detail="Fault report not found")

    if status_update.status:
        fault.status = status_update.status
        if status_update.status == FaultStatus.VERIFIED_CLOSED:
            fault.resolved_at = datetime.now(timezone.utc)
            # Restore operational status if all faults are closed
            inst = fault.installation
            if inst:
                open_faults = db.query(FaultReport).filter(
                    FaultReport.installation_id == inst.id,
                    FaultReport.status.notin_([FaultStatus.VERIFIED_CLOSED])
                ).count()
                if open_faults <= 1:
                    inst.operational_status = OperationalStatus.OPERATIONAL

    db.commit()
    db.refresh(fault)
    out = FaultOut.model_validate(fault)
    if fault.installation:
        out.installation_name = fault.installation.name
    return out

