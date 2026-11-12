from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    installations,
    faults,
    maintenance,
    evidence,
    analytics,
    notifications
)

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health & Diagnostics"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Users"])
api_router.include_router(installations.router, prefix="/installations", tags=["Solar Installations (PostGIS)"])
api_router.include_router(faults.router, prefix="/faults", tags=["Fault & Incident Reporting"])
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["Technician Work Orders & Dispatch"])
api_router.include_router(evidence.router, prefix="/evidence", tags=["Repair Proof & Verification"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Fleet Analytics & MTTR"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["In-App Notifications"])
