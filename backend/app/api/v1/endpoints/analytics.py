from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.installation import SolarInstallation, OperationalStatus
from app.models.fault import FaultReport, FaultStatus, FaultCategory, FaultSeverity
from app.models.evidence import RepairEvidence, VerificationStatus
from app.models.user import User, UserRole
from app.models.activity import ActivityLog
from app.schemas.analytics import AnalyticsSummary

router = APIRouter()


@router.get("/dashboard", response_model=AnalyticsSummary, summary="Fleet & Reliability Analytics")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    """Computes comprehensive metrics: MTTR, uptime, fault breakdown, and technician load."""
    total_inst = db.query(SolarInstallation).count()
    total_capacity = db.query(func.coalesce(func.sum(SolarInstallation.capacity_kw), 0.0)).scalar()

    operational = db.query(SolarInstallation).filter(SolarInstallation.operational_status == OperationalStatus.OPERATIONAL).count()
    under_maint = db.query(SolarInstallation).filter(SolarInstallation.operational_status == OperationalStatus.UNDER_MAINTENANCE).count()
    inactive = db.query(SolarInstallation).filter(SolarInstallation.operational_status == OperationalStatus.INACTIVE).count()

    fleet_health = round((operational / total_inst * 100.0), 1) if total_inst > 0 else 100.0

    open_faults = db.query(FaultReport).filter(
        FaultReport.status.in_([FaultStatus.REPORTED, FaultStatus.ASSIGNED, FaultStatus.IN_PROGRESS, FaultStatus.REJECTED_REOPENED])
    ).count()

    verified_repairs = db.query(RepairEvidence).filter(RepairEvidence.status == VerificationStatus.APPROVED).count()

    # Calculate Average MTTR (Mean Time to Repair) in hours
    closed_faults = db.query(FaultReport).filter(
        FaultReport.status == FaultStatus.VERIFIED_CLOSED,
        FaultReport.resolved_at != None
    ).all()

    mttr_sum = 0.0
    mttr_count = 0
    for f in closed_faults:
        if f.created_at and f.resolved_at:
            delta_hours = (f.resolved_at - f.created_at).total_seconds() / 3600.0
            if delta_hours > 0:
                mttr_sum += delta_hours
                mttr_count += 1
    avg_mttr = round(mttr_sum / mttr_count, 1) if mttr_count > 0 else 0.0

    # Faults by Category
    faults_by_cat = {}
    for cat in FaultCategory:
        count = db.query(FaultReport).filter(FaultReport.category == cat).count()
        faults_by_cat[cat.value] = count

    # Faults by Severity
    faults_by_sev = {}
    for sev in FaultSeverity:
        count = db.query(FaultReport).filter(FaultReport.severity == sev).count()
        faults_by_sev[sev.value] = count

    # Technician Workloads
    technicians = db.query(User).filter(User.role.in_([UserRole.TECHNICIAN, UserRole.MAINTAINER])).all()
    tech_workloads = []
    for t in technicians:
        assigned_jobs = t.assigned_jobs
        active_jobs = [j for j in assigned_jobs if j.completed_at is None]
        completed_jobs = [j for j in assigned_jobs if j.completed_at is not None]
        tech_workloads.append({
            "technician_id": t.id,
            "name": t.full_name,
            "active_tickets": len(active_jobs),
            "completed_repairs": len(completed_jobs),
            "utilization": min(100, int((len(active_jobs) / 5.0) * 100)) # Assume 5 jobs is max capacity
        })

    # Recent Activity Feed
    recent_logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(10).all()
    activity_items = [
        {
            "id": l.id,
            "action": l.action,
            "user_name": l.user_name,
            "description": l.description,
            "created_at": l.created_at.isoformat() if l.created_at else None,
            "entity_type": l.entity_type
        }
        for l in recent_logs
    ]

    return {
        "total_installations": total_inst,
        "total_capacity_kw": round(float(total_capacity), 1),
        "operational_count": operational,
        "under_maintenance_count": under_maint,
        "inactive_count": inactive,
        "fleet_health_percentage": fleet_health,
        "open_fault_tickets": open_faults,
        "verified_repairs_count": verified_repairs,
        "average_mttr_hours": avg_mttr,
        "faults_by_category": faults_by_cat,
        "faults_by_severity": faults_by_sev,
        "technician_workloads": tech_workloads,
        "recent_activity": activity_items
    }

