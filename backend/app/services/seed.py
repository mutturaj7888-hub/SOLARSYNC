import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.core.mongodb import save_user_to_mongodb
from app.models.user import User, UserRole
from app.models.installation import SolarInstallation, Equipment, InstallationType, OperationalStatus, EquipmentType
from app.models.fault import FaultReport, FaultCategory, FaultSeverity, FaultStatus
from app.models.maintenance import MaintenanceAssignment, MaintenanceSchedule, PriorityLevel, ScheduleFrequency, ScheduleStatus
from app.models.evidence import RepairEvidence, VerificationStatus
from app.models.activity import ActivityLog

logger = logging.getLogger("solarsync.seed")


def seed_database(db: Session):
    """Populates clean production users, registered solar installations, and maintenance records."""
    if db.query(User).first():
        logger.info("Database already contains data, syncing users to MongoDB.")
        from app.core.mongodb import sync_sql_users_to_mongodb
        sync_sql_users_to_mongodb(db)
        return

    logger.info("Seeding initial SolarSync data...")

    # 1. Seed Roles & Users
    admin = User(
        email="admin@solarsync.io",
        hashed_password=get_password_hash("SolarAdmin123!"),
        full_name="Rajesh Sharma",
        phone_number="+91 98450 11001",
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True
    )
    owner = User(
        email="owner@solarsync.io",
        hashed_password=get_password_hash("SolarOwner123!"),
        full_name="Priya Patel",
        phone_number="+91 98450 22002",
        role=UserRole.INSTALLATION_OWNER,
        is_active=True,
        is_verified=True
    )
    tech1 = User(
        email="tech@solarsync.io",
        hashed_password=get_password_hash("SolarTech123!"),
        full_name="Arun Kumar",
        phone_number="+91 98450 33003",
        role=UserRole.TECHNICIAN,
        is_active=True,
        is_verified=True
    )
    tech2 = User(
        email="tech2@solarsync.io",
        hashed_password=get_password_hash("SolarTech123!"),
        full_name="Kavita Reddy",
        phone_number="+91 98450 44004",
        role=UserRole.TECHNICIAN,
        is_active=True,
        is_verified=True
    )
    db.add_all([admin, owner, tech1, tech2])
    db.commit()

    # Mirror seeded users directly into MongoDB
    for u in [admin, owner, tech1, tech2]:
        save_user_to_mongodb({
            "id": u.id,
            "email": u.email,
            "hashed_password": u.hashed_password,
            "full_name": u.full_name,
            "phone_number": u.phone_number,
            "role": u.role.value,
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    # 2. Seed Registered Solar Installations (Bengaluru Hub)
    installations_data = [
        {
            "name": "MG Road Commercial Rooftop Array",
            "address": "42 Trinity Circle, MG Road",
            "city": "Bengaluru",
            "state": "Karnataka",
            "postal_code": "560001",
            "latitude": 12.9734,
            "longitude": 77.6186,
            "capacity_kw": 50.0,
            "installation_type": InstallationType.ROOFTOP_COMMERCIAL,
            "operational_status": OperationalStatus.OPERATIONAL,
            "inverter": "Sungrow SG50CX (50 kW)",
            "panels": "Canadian Solar HiKu6 540W Mono"
        },
        {
            "name": "Indiranagar Green Solar Station",
            "address": "100ft Road, 12th Main, Indiranagar",
            "city": "Bengaluru",
            "state": "Karnataka",
            "postal_code": "560038",
            "latitude": 12.9719,
            "longitude": 77.6412,
            "capacity_kw": 12.5,
            "installation_type": InstallationType.ROOFTOP_RESIDENTIAL,
            "operational_status": OperationalStatus.OPERATIONAL,
            "inverter": "Fronius Primo 10.0-1 (10 kW)",
            "panels": "LONGi Solar Hi-MO 5 540W"
        },
        {
            "name": "Koramangala Commercial Solar Park",
            "address": "80ft Road, 4th Block, Koramangala",
            "city": "Bengaluru",
            "state": "Karnataka",
            "postal_code": "560034",
            "latitude": 12.9352,
            "longitude": 77.6245,
            "capacity_kw": 28.0,
            "installation_type": InstallationType.ROOFTOP_COMMERCIAL,
            "operational_status": OperationalStatus.UNDER_MAINTENANCE,
            "inverter": "SMA Sunny Tripower 25000TL",
            "panels": "Jinko Solar Tiger Pro 535W"
        },
        {
            "name": "Whitefield Tech Park Solar Canopy",
            "address": "Export Promotion Industrial Area, Whitefield",
            "city": "Bengaluru",
            "state": "Karnataka",
            "postal_code": "560066",
            "latitude": 12.9868,
            "longitude": 77.7376,
            "capacity_kw": 120.0,
            "installation_type": InstallationType.SOLAR_CARPORT,
            "operational_status": OperationalStatus.OPERATIONAL,
            "inverter": "Huawei SUN2000-100KTL",
            "panels": "Trina Solar Vertex 670W"
        },
        {
            "name": "Electronic City Industrial Microgrid",
            "address": "Phase 1, Hosur Road, Electronic City",
            "city": "Bengaluru",
            "state": "Karnataka",
            "postal_code": "560100",
            "latitude": 12.8452,
            "longitude": 77.6602,
            "capacity_kw": 85.0,
            "installation_type": InstallationType.GROUND_MOUNTED,
            "operational_status": OperationalStatus.OPERATIONAL,
            "inverter": "Sungrow SG110CX",
            "panels": "Vikram Solar Somera 540W"
        },
        {
            "name": "Jayanagar Residential Solar Hub",
            "address": "33rd Cross, 4th Block, Jayanagar",
            "city": "Bengaluru",
            "state": "Karnataka",
            "postal_code": "560011",
            "latitude": 12.9299,
            "longitude": 77.5824,
            "capacity_kw": 6.8,
            "installation_type": InstallationType.ROOFTOP_RESIDENTIAL,
            "operational_status": OperationalStatus.OPERATIONAL,
            "inverter": "Growatt MIN 6000TL-X",
            "panels": "Waaree Energies 535W Bifacial"
        },
        {
            "name": "Hebbal Solar Carport Array",
            "address": "Near Hebbal Flyover, Bellary Road",
            "city": "Bengaluru",
            "state": "Karnataka",
            "postal_code": "560024",
            "latitude": 13.0358,
            "longitude": 77.5970,
            "capacity_kw": 40.0,
            "installation_type": InstallationType.SOLAR_CARPORT,
            "operational_status": OperationalStatus.DEGRADED,
            "inverter": "Fronius Symo 20.0-3-M",
            "panels": "Canadian Solar BiHiKu7 650W"
        },
    ]

    created_insts = []
    for item in installations_data:
        inst = SolarInstallation(
            name=item["name"],
            address=item["address"],
            city=item["city"],
            state=item["state"],
            postal_code=item["postal_code"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            capacity_kw=item["capacity_kw"],
            installation_type=item["installation_type"],
            operational_status=item["operational_status"],
            is_demo_data=False,
            owner_id=owner.id,
            commissioning_date=datetime.now(timezone.utc) - timedelta(days=180)
        )
        db.add(inst)
        db.commit()
        db.refresh(inst)

        # Inverter Equipment
        eq1 = Equipment(
            installation_id=inst.id,
            equipment_type=EquipmentType.INVERTER,
            manufacturer=item["inverter"].split()[0],
            model_number=item["inverter"],
            serial_number=f"SN-INV-{inst.id:04d}",
            capacity_rating=f"{inst.capacity_kw} kW",
            warranty_expiry=datetime.now(timezone.utc) + timedelta(days=365 * 5),
            status="operational"
        )
        # Solar Panel Equipment
        eq2 = Equipment(
            installation_id=inst.id,
            equipment_type=EquipmentType.SOLAR_PANEL,
            manufacturer=item["panels"].split()[0],
            model_number=item["panels"],
            serial_number=f"SN-PAN-{inst.id:04d}",
            capacity_rating="540 W Mono PERC",
            warranty_expiry=datetime.now(timezone.utc) + timedelta(days=365 * 10),
            status="operational"
        )
        db.add_all([eq1, eq2])
        created_insts.append(inst)

    db.commit()

    # 3. Seed Sample Fault Tickets & Maintenance Records
    target_inst = created_insts[2] # Koramangala
    fault1 = FaultReport(
        ticket_number="FLT-7A9B1C",
        title="Inverter Grid Synchronization Failure",
        description="Inverter error code E031: Grid voltage fluctuation causing continuous MPPT tripping during peak sunlight hours.",
        category=FaultCategory.INVERTER_FAILURE,
        severity=FaultSeverity.HIGH,
        status=FaultStatus.ASSIGNED,
        photo_url="https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80",
        installation_id=target_inst.id,
        reported_by_id=owner.id,
        created_at=datetime.now(timezone.utc) - timedelta(hours=14)
    )
    db.add(fault1)
    db.commit()
    db.refresh(fault1)

    assign1 = MaintenanceAssignment(
        fault_report_id=fault1.id,
        technician_id=tech1.id,
        priority=PriorityLevel.EXPEDITED,
        dispatch_notes="Perform grid relay calibration and verify AC terminal torque.",
        assigned_at=datetime.now(timezone.utc) - timedelta(hours=10)
    )
    db.add(assign1)

    # 4. Seed Verified Completed Repair (to show verified loop)
    closed_inst = created_insts[0] # MG Road
    fault2 = FaultReport(
        ticket_number="FLT-3E2D8F",
        title="Damaged MC4 DC Connector on String 3",
        description="Thermal hotspots detected on String 3 positive junction causing DC ground fault warning.",
        category=FaultCategory.WIRING_GROUND_FAULT,
        severity=FaultSeverity.MEDIUM,
        status=FaultStatus.VERIFIED_CLOSED,
        photo_url="https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
        installation_id=closed_inst.id,
        reported_by_id=owner.id,
        created_at=datetime.now(timezone.utc) - timedelta(days=5),
        resolved_at=datetime.now(timezone.utc) - timedelta(days=3)
    )
    db.add(fault2)
    db.commit()
    db.refresh(fault2)

    evidence2 = RepairEvidence(
        fault_report_id=fault2.id,
        before_photo_url="https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80",
        after_photo_url="https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
        work_summary="Replaced crimped MC4 connectors with Stäubli MC4-Evo2 ratings. Insulation resistance tested at >500 MΩ.",
        parts_replaced="2x MC4-Evo2 Connectors, 4mm² Solar DC Cable (2m)",
        repair_duration_hours=3,
        status=VerificationStatus.APPROVED,
        verified_by_id=admin.id,
        verification_notes="Verified insulation test report and thermographic scan. Clean repair.",
        submitted_at=datetime.now(timezone.utc) - timedelta(days=4),
        verified_at=datetime.now(timezone.utc) - timedelta(days=3)
    )
    db.add(evidence2)

    # 5. Activity Log Seed
    act1 = ActivityLog(
        user_name=owner.full_name,
        action="FAULT_REPORTED",
        description="Reported Inverter Grid Synchronization Failure on Koramangala Commercial Solar Park",
        entity_type="fault",
        entity_id=fault1.id,
        created_at=datetime.now(timezone.utc) - timedelta(hours=14)
    )
    act2 = ActivityLog(
        user_name=admin.full_name,
        action="JOB_ASSIGNED",
        description=f"Assigned Ticket {fault1.ticket_number} to Lead Technician Arun Kumar",
        entity_type="assignment",
        entity_id=1,
        created_at=datetime.now(timezone.utc) - timedelta(hours=10)
    )
    act3 = ActivityLog(
        user_name=admin.full_name,
        action="REPAIR_VERIFIED",
        description=f"Verified and closed Ticket {fault2.ticket_number} with approved photographic evidence",
        entity_type="fault",
        entity_id=fault2.id,
        created_at=datetime.now(timezone.utc) - timedelta(days=3)
    )
    db.add_all([act1, act2, act3])
    db.commit()
    logger.info("Database seeding completed successfully.")
