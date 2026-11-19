from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.fault import FaultReport, FaultStatus
from app.models.maintenance import (
    MaintenanceAssignment,
    MaintenanceSchedule,
    PriorityLevel,
    ScheduleStatus
)
from app.models.notification import Notification
from app.models.activity import ActivityLog
from app.schemas.maintenance import (
    AssignmentCreate,
    AssignmentOut,
    AssignmentStatusUpdate,
    ScheduleCreate,
    ScheduleOut
)
from app.api.deps import get_current_user, require_roles
from app.workers.tasks import send_maintenance_notification

router = APIRouter()


@router.get("/assignments", response_model=List[AssignmentOut], summary="List Maintenance Work Orders")
def get_assignments(
    technician_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve work order assignments. Strictly role-scoped: Maintainers see only their queue, Owners see their installations, Admin sees all."""
    query = db.query(MaintenanceAssignment)
    
    if current_user.role in [UserRole.TECHNICIAN, UserRole.MAINTAINER]:
        query = query.filter(MaintenanceAssignment.technician_id == current_user.id)
    elif current_user.role == UserRole.INSTALLATION_OWNER:
        from app.models.installation import SolarInstallation
        user_inst_ids = [inst.id for inst in db.query(SolarInstallation.id).filter(SolarInstallation.owner_id == current_user.id).all()]
        query = query.join(FaultReport).filter(FaultReport.installation_id.in_(user_inst_ids))
    elif technician_id:
        query = query.filter(MaintenanceAssignment.technician_id == technician_id)

    assignments = query.order_by(MaintenanceAssignment.assigned_at.desc()).all()
    
    results = []
    for a in assignments:
        out = AssignmentOut.model_validate(a)
        if a.technician:
            out.technician_name = a.technician.full_name
        if a.fault_report:
            out.ticket_number = a.fault_report.ticket_number
            out.fault_status = a.fault_report.status.value if hasattr(a.fault_report.status, 'value') else str(a.fault_report.status)
        results.append(out)
    return results


@router.post("/assignments", response_model=AssignmentOut, summary="Assign Maintenance Job to Maintainer")
def assign_technician(
    assign_in: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DISTRIBUTOR, UserRole.ADMIN]))
):
    """Distributor allocates an open fault ticket from nearby requests to a certified field maintainer."""
    fault = db.query(FaultReport).filter(FaultReport.id == assign_in.fault_report_id).first()
    if not fault:
        raise HTTPException(status_code=404, detail="Fault report not found")

    tech = db.query(User).filter(
        User.id == assign_in.technician_id,
        User.role.in_([UserRole.TECHNICIAN, UserRole.MAINTAINER])
    ).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Selected maintainer not found or invalid role")

    # Check if already assigned
    existing = db.query(MaintenanceAssignment).filter(MaintenanceAssignment.fault_report_id == fault.id).first()
    if existing:
        existing.technician_id = tech.id
        existing.priority = assign_in.priority
        existing.dispatch_notes = assign_in.dispatch_notes
        db_assign = existing
    else:
        db_assign = MaintenanceAssignment(
            fault_report_id=fault.id,
            technician_id=tech.id,
            priority=assign_in.priority,
            dispatch_notes=assign_in.dispatch_notes
        )
        db.add(db_assign)

    # Update fault status to ASSIGNED
    fault.status = FaultStatus.ASSIGNED
    db.commit()
    db.refresh(db_assign)

    # Dispatch notification to technician
    notif = Notification(
        user_id=tech.id,
        title="New Work Order Dispatched",
        message=f"You have been assigned to Ticket {fault.ticket_number}: {fault.title} ({assign_in.priority.value} priority)",
        event_type="job_assignment",
        link_url=f"/maintenance?ticket={fault.ticket_number}"
    )
    db.add(notif)

    # Activity Log
    log = ActivityLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="JOB_ASSIGNED",
        description=f"Ticket {fault.ticket_number} assigned to technician {tech.full_name}",
        entity_type="assignment",
        entity_id=db_assign.id
    )
    db.add(log)
    db.commit()

    # Trigger async notification in daemon thread so offline Redis never blocks response
    try:
        import threading
        def _async_notify():
            try:
                send_maintenance_notification.apply_async(
                    kwargs={
                        "user_id": tech.id,
                        "message": f"Work order dispatched: {fault.ticket_number}",
                        "event_type": "DISPATCH"
                    },
                    connect_timeout=0.5
                )
            except Exception:
                pass
        threading.Thread(target=_async_notify, daemon=True).start()
    except Exception:
        pass

    out = AssignmentOut.model_validate(db_assign)
    out.technician_name = tech.full_name
    out.ticket_number = fault.ticket_number
    out.fault_status = fault.status.value if hasattr(fault.status, 'value') else str(fault.status)
    return out


@router.put("/assignments/{assignment_id}/progress", response_model=AssignmentOut, summary="Update Technician Job Progress")
def update_assignment_progress(
    assignment_id: int,
    progress: AssignmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Technicians transition job from Assigned → In Progress → Resolved (Awaiting Evidence)."""
    assign = db.query(MaintenanceAssignment).filter(MaintenanceAssignment.id == assignment_id).first()
    if not assign:
        raise HTTPException(status_code=404, detail="Maintenance assignment not found")

    if current_user.role != UserRole.ADMIN and assign.technician_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own assigned work orders")

    fault = assign.fault_report
    now = datetime.now(timezone.utc)

    if progress.status == "started":
        assign.started_at = now
        fault.status = FaultStatus.IN_PROGRESS
    elif progress.status == "completed":
        assign.completed_at = now
        fault.status = FaultStatus.RESOLVED_PENDING_VERIFICATION

    db.commit()
    db.refresh(assign)

    out = AssignmentOut.model_validate(assign)
    if assign.technician:
        out.technician_name = assign.technician.full_name
    if fault:
        out.ticket_number = fault.ticket_number
        out.fault_status = fault.status.value if hasattr(fault.status, 'value') else str(fault.status)
    return out


@router.get("/schedules", response_model=List[ScheduleOut], summary="List Preventive Maintenance Schedules")
def get_schedules(
    installation_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """List scheduled recurring inspections."""
    query = db.query(MaintenanceSchedule)
    if installation_id:
        query = query.filter(MaintenanceSchedule.installation_id == installation_id)
    return query.order_by(MaintenanceSchedule.scheduled_date.asc()).all()


@router.post("/schedules", response_model=ScheduleOut, summary="Create Preventive Maintenance Schedule")
def create_schedule(
    sched_in: ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.INSTALLATION_OWNER]))
):
    """Plan preventive maintenance visits (e.g. quarterly thermographic panel inspection)."""
    sched = MaintenanceSchedule(
        installation_id=sched_in.installation_id,
        title=sched_in.title,
        frequency=sched_in.frequency,
        scheduled_date=sched_in.scheduled_date,
        status=ScheduleStatus.PENDING,
        checklist_template=sched_in.checklist_template
    )
    db.add(sched)
    db.commit()
    db.refresh(sched)
    return sched

