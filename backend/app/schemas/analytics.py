from typing import List, Dict, Any
from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_installations: int
    total_capacity_kw: float
    operational_count: int
    under_maintenance_count: int
    inactive_count: int
    fleet_health_percentage: float
    open_fault_tickets: int
    verified_repairs_count: int
    average_mttr_hours: float
    faults_by_category: Dict[str, int]
    faults_by_severity: Dict[str, int]
    technician_workloads: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]

