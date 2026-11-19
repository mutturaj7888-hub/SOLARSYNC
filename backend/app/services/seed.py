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

# Verified Real-World Solar Installations & Technical Specs in Karnataka
REAL_SOLAR_INSTALLATIONS = [
    {
        "name": "M. Chinnaswamy Stadium Rooftop Solar Plant",
        "address": "MG Road / Queen's Road, Shivaji Nagar",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": "560001",
        "latitude": 12.9788,
        "longitude": 77.5996,
        "capacity_kw": 400.0,
        "installation_type": InstallationType.ROOFTOP_COMMERCIAL,
        "operational_status": OperationalStatus.OPERATIONAL,
        "inverter": "RenXSol 20kW Grid-Tie Inverters (x20)",
        "inverter_mfr": "RenXSol",
        "panels": "Multi-crystalline 300Wp 72-cell High-Tension Modules",
        "panels_mfr": "Tata Power Solar"
    },
    {
        "name": "Kempegowda International Airport (BLR) Cargo Solar Plant",
        "address": "Air India SATS & Cargo Village, Devanahalli",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": "560300",
        "latitude": 13.1986,
        "longitude": 77.7066,
        "capacity_kw": 3350.0,
        "installation_type": InstallationType.ROOFTOP_COMMERCIAL,
        "operational_status": OperationalStatus.OPERATIONAL,
        "inverter": "Sunshot Multi-MPPT Cloud-IoT String Inverters",
        "inverter_mfr": "Sunshot",
        "panels": "Anti-Glare Aviation Mono PERC 540W Modules",
        "panels_mfr": "Canadian Solar"
    },
    {
        "name": "Kempegowda International Airport Solar Carport Array",
        "address": "Terminal 1 & 2 Multi-Level Car Parking, Devanahalli",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": "560300",
        "latitude": 13.1930,
        "longitude": 77.7040,
        "capacity_kw": 2925.0,
        "installation_type": InstallationType.SOLAR_CARPORT,
        "operational_status": OperationalStatus.UNDER_MAINTENANCE,
        "inverter": "SMA Sunny Highpower Peak3 150kW Inverters",
        "inverter_mfr": "SMA",
        "panels": "Bifacial Dual-Glass Mono PERC 650W Modules",
        "panels_mfr": "Trina Solar"
    },
    {
        "name": "Namma Metro (BMRCL) Baiyappanahalli Train Depot Solar Plant",
        "address": "Old Madras Road, Baiyappanahalli Depot",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": "560038",
        "latitude": 12.9904,
        "longitude": 77.6525,
        "capacity_kw": 1840.0,
        "installation_type": InstallationType.GROUND_MOUNTED,
        "operational_status": OperationalStatus.OPERATIONAL,
        "inverter": "Sungrow SG110CX 110kW Commercial String Inverters",
        "inverter_mfr": "Sungrow",
        "panels": "Waaree Energies 540W Mono PERC Modules",
        "panels_mfr": "Waaree Energies"
    },
    {
        "name": "Namma Metro (BMRCL) Peenya Depot Solar Installation",
        "address": "Tumkur Road, Peenya Industrial Area",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": "560058",
        "latitude": 13.0329,
        "longitude": 77.5255,
        "capacity_kw": 2460.0,
        "installation_type": InstallationType.ROOFTOP_COMMERCIAL,
        "operational_status": OperationalStatus.OPERATIONAL,
        "inverter": "Huawei SUN2000-100KTL-M1 Smart Inverters",
        "inverter_mfr": "Huawei",
        "panels": "Vikram Solar Somera 535W Half-Cell Modules",
        "panels_mfr": "Vikram Solar"
    },
    {
        "name": "Indian Institute of Science (IISc) Green Campus Solar Array",
        "address": "CV Raman Road, Malleshwaram",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": "560012",
        "latitude": 13.0219,
        "longitude": 77.5671,
        "capacity_kw": 1500.0,
        "installation_type": InstallationType.ROOFTOP_COMMERCIAL,
        "operational_status": OperationalStatus.OPERATIONAL,
        "inverter": "Fronius Symo 20.0-3-M 3-Phase Inverters",
        "inverter_mfr": "Fronius",
        "panels": "Tata Power Solar 400W Multi-Crystalline Modules",
        "panels_mfr": "Tata Power Solar"
    },
    {
        "name": "Pavagada Solar Park (Shakti Sthala) - Block 1 Substation",
        "address": "Tirumani / Balasamudra Solar Complex, Pavagada Taluk",
        "city": "Tumakuru District",
        "state": "Karnataka",
        "postal_code": "561202",
        "latitude": 14.2500,
        "longitude": 77.4500,
        "capacity_kw": 50000.0,
        "installation_type": InstallationType.GROUND_MOUNTED,
        "operational_status": OperationalStatus.OPERATIONAL,
        "inverter": "Sungrow 3.125 MW Central Inverter Transformer Units",
        "inverter_mfr": "Sungrow",
        "panels": "Risen Energy 540W Utility Scale PV Modules",
        "panels_mfr": "Risen Energy"
    },
    {
        "name": "BESCOM Indiranagar Residential Rooftop Cluster",
        "address": "100ft Road, 12th Main, HAL 2nd Stage, Indiranagar",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": "560038",
        "latitude": 12.9719,
        "longitude": 77.6412,
        "capacity_kw": 15.0,
        "installation_type": InstallationType.ROOFTOP_RESIDENTIAL,
        "operational_status": OperationalStatus.OPERATIONAL,
        "inverter": "Growatt MIN 6000TL-X Dual-MPPT Inverters",
        "inverter_mfr": "Growatt",
        "panels": "LONGi Solar Hi-MO 5 540W Monocrystalline",
        "panels_mfr": "LONGi Solar"
    },
    {
        "name": "Jayanagar 4th Block Sustainable Residence",
        "address": "33rd Cross, 4th Block, Jayanagar",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": "560011",
        "latitude": 12.9299,
        "longitude": 77.5824,
        "capacity_kw": 8.5,
        "installation_type": InstallationType.ROOFTOP_RESIDENTIAL,
        "operational_status": OperationalStatus.OPERATIONAL,
        "inverter": "Fronius Primo 8.2-1 Single Phase Inverter",
        "inverter_mfr": "Fronius",
        "panels": "Waaree Energies 440W All-Black Monocrystalline",
        "panels_mfr": "Waaree Energies"
    },
    {
        "name": "Koramangala 4th Block Commercial Rooftop",
        "address": "80ft Road, 4th Block, Koramangala",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": "560034",
        "latitude": 12.9352,
        "longitude": 77.6245,
        "capacity_kw": 28.0,
        "installation_type": InstallationType.ROOFTOP_COMMERCIAL,
        "operational_status": OperationalStatus.UNDER_MAINTENANCE,
        "inverter": "SMA Sunny Tripower 25000TL Inverter",
        "inverter_mfr": "SMA",
        "panels": "Jinko Solar Tiger Pro 535W Mono PERC",
        "panels_mfr": "Jinko Solar"
    }
]


def seed_database(db: Session, force_reload: bool = False):
    """Populates verified real-world solar assets, certifications, and maintenance records."""
    # 1. Seed or retrieve base role users
    distributor = db.query(User).filter(User.email == "distributor@solarsync.io").first()
    if not distributor:
        distributor = User(
            email="distributor@solarsync.io",
            hashed_password=get_password_hash("SolarDist123!"),
            full_name="Rajesh Sharma",
            phone_number="+91 98450 11001",
            role=UserRole.DISTRIBUTOR,
            is_active=True,
            is_verified=True
        )
        db.add(distributor)

    admin = db.query(User).filter(User.email == "admin@solarsync.io").first()
    if not admin:
        admin = User(
            email="admin@solarsync.io",
            hashed_password=get_password_hash("SolarAdmin123!"),
            full_name="SolarSync Admin",
            phone_number="+91 98450 11001",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        db.add(admin)

    owner = db.query(User).filter(User.email == "owner@solarsync.io").first()
    if not owner:
        owner = User(
            email="owner@solarsync.io",
            hashed_password=get_password_hash("SolarOwner123!"),
            full_name="Priya Patel",
            phone_number="+91 98450 22002",
            role=UserRole.INSTALLATION_OWNER,
            is_active=True,
            is_verified=True
        )
        db.add(owner)

    tech1 = db.query(User).filter(User.email == "tech@solarsync.io").first()
    if not tech1:
        tech1 = User(
            email="tech@solarsync.io",
            hashed_password=get_password_hash("SolarTech123!"),
            full_name="Arun Kumar",
            phone_number="+91 98450 33003",
            role=UserRole.TECHNICIAN,
            is_active=True,
            is_verified=True
        )
        db.add(tech1)

    tech2 = db.query(User).filter(User.email == "tech2@solarsync.io").first()
    if not tech2:
        tech2 = User(
            email="tech2@solarsync.io",
            hashed_password=get_password_hash("SolarTech123!"),
            full_name="Kavita Reddy",
            phone_number="+91 98450 44004",
            role=UserRole.TECHNICIAN,
            is_active=True,
            is_verified=True
        )
        db.add(tech2)

    db.commit()
    for u in [distributor, admin, owner, tech1, tech2]:
        db.refresh(u)
        save_user_to_mongodb({
            "id": u.id,
            "email": u.email,
            "hashed_password": u.hashed_password,
            "full_name": u.full_name,
            "phone_number": u.phone_number,
            "role": u.role.value if hasattr(u.role, 'value') else str(u.role),
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    # 2. Check if real-world solar installations already exist
    existing_inst = db.query(SolarInstallation).filter(
        SolarInstallation.name.like("%Chinnaswamy%")
    ).first()

    if existing_inst and not force_reload:
        logger.info("Real solar data already present in database.")
        from app.core.mongodb import sync_sql_users_to_mongodb
        sync_sql_users_to_mongodb(db)
        return

    logger.info("Seeding verified real-world solar infrastructure...")

    # Clear outdated generic installations if refreshing
    if force_reload:
        db.query(RepairEvidence).delete()
        db.query(MaintenanceAssignment).delete()
        db.query(FaultReport).delete()
        db.query(Equipment).delete()
        db.query(SolarInstallation).delete()
        db.commit()

    created_insts = []
    for item in REAL_SOLAR_INSTALLATIONS:
        inst = db.query(SolarInstallation).filter(SolarInstallation.name == item["name"]).first()
        if not inst:
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
                commissioning_date=datetime.now(timezone.utc) - timedelta(days=240)
            )
            db.add(inst)
            db.commit()
            db.refresh(inst)

            eq1 = Equipment(
                installation_id=inst.id,
                equipment_type=EquipmentType.INVERTER,
                manufacturer=item["inverter_mfr"],
                model_number=item["inverter"],
                serial_number=f"SN-INV-{inst.id:04d}",
                capacity_rating=f"{inst.capacity_kw} kW",
                warranty_expiry=datetime.now(timezone.utc) + timedelta(days=365 * 5),
                status="operational" if inst.operational_status == OperationalStatus.OPERATIONAL else "maintenance_required"
            )
            eq2 = Equipment(
                installation_id=inst.id,
                equipment_type=EquipmentType.SOLAR_PANEL,
                manufacturer=item["panels_mfr"],
                model_number=item["panels"],
                serial_number=f"SN-PAN-{inst.id:04d}",
                capacity_rating="540W - 650W Tier-1 PV",
                warranty_expiry=datetime.now(timezone.utc) + timedelta(days=365 * 10),
                status="operational"
            )
            db.add_all([eq1, eq2])
            db.commit()
        created_insts.append(inst)

    # 3. Seed Realistic Fault Reports based on actual field operations
    if len(created_insts) >= 4 and db.query(FaultReport).count() == 0:
        chinnaswamy = created_insts[0]
        koramangala = created_insts[9] if len(created_insts) > 9 else created_insts[1]
        airport_carport = created_insts[2]
        metro_depot = created_insts[3]

        # Ticket 1: Active Assigned
        fault1 = FaultReport(
            ticket_number="FLT-BLR-0412",
            title="Inverter String 4 MPPT Grid Under-Voltage Trip (BESCOM 11kV Feeder Fluctuation)",
            description="String inverter #4 (20kW Grid-Tie) reported error code E014: High grid impedance on 11kV bus during afternoon load surge, causing MPPT 2 curtailment.",
            category=FaultCategory.INVERTER_FAILURE,
            severity=FaultSeverity.HIGH,
            status=FaultStatus.ASSIGNED,
            photo_url="https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80",
            installation_id=chinnaswamy.id,
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
            dispatch_notes="Inspect 11kV step-up transformer tap changer and re-calibrate inverter AC voltage protection thresholds.",
            assigned_at=datetime.now(timezone.utc) - timedelta(hours=10)
        )
        db.add(assign1)

        # Ticket 2: In Progress
        fault2 = FaultReport(
            ticket_number="FLT-BLR-0891",
            title="Thermal Hotspot on Jinko Tiger Pro DC String Isolator",
            description="FLIR thermal scan revealed 74°C hotspot at DC combiner box positive terminal on String 2. Requires replacement with Stäubli MC4-Evo2 connectors.",
            category=FaultCategory.WIRING_GROUND_FAULT,
            severity=FaultSeverity.MEDIUM,
            status=FaultStatus.IN_PROGRESS,
            photo_url="https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
            installation_id=koramangala.id,
            reported_by_id=owner.id,
            created_at=datetime.now(timezone.utc) - timedelta(hours=8)
        )
        db.add(fault2)
        db.commit()
        db.refresh(fault2)

        assign2 = MaintenanceAssignment(
            fault_report_id=fault2.id,
            technician_id=tech2.id,
            priority=PriorityLevel.ROUTINE,
            dispatch_notes="Field technician dispatched with thermal imaging camera and MC4-Evo2 connector crimping toolkit.",
            assigned_at=datetime.now(timezone.utc) - timedelta(hours=6),
            started_at=datetime.now(timezone.utc) - timedelta(hours=2)
        )
        db.add(assign2)

        # Ticket 3: New Reported
        fault3 = FaultReport(
            ticket_number="FLT-BLR-1104",
            title="Optical Transmission Soiling & Aviation Anti-Glare Degradation",
            description="Airport photometric sensors registered 14.8% irradiance attenuation on Carport Array Block C due to perimeter dust accumulation.",
            category=FaultCategory.SHADING_SOILING,
            severity=FaultSeverity.LOW,
            status=FaultStatus.REPORTED,
            photo_url="https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80",
            installation_id=airport_carport.id,
            reported_by_id=owner.id,
            created_at=datetime.now(timezone.utc) - timedelta(hours=3)
        )
        db.add(fault3)

        # Ticket 4: Verified Closed
        fault4 = FaultReport(
            ticket_number="FLT-BLR-0233",
            title="Low Insulation Resistance (RISO < 0.2 MΩ on Array Feeder 2)",
            description="Underground conduit water ingress caused insulation breakdown on 1.1kV XLPE solar DC feeder cable at depot trackside.",
            category=FaultCategory.WIRING_GROUND_FAULT,
            severity=FaultSeverity.HIGH,
            status=FaultStatus.VERIFIED_CLOSED,
            photo_url="https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
            installation_id=metro_depot.id,
            reported_by_id=owner.id,
            created_at=datetime.now(timezone.utc) - timedelta(days=5),
            resolved_at=datetime.now(timezone.utc) - timedelta(days=2)
        )
        db.add(fault4)
        db.commit()
        db.refresh(fault4)

        evidence4 = RepairEvidence(
            fault_report_id=fault4.id,
            before_photo_url="https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80",
            after_photo_url="https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
            work_summary="Replaced damaged 15m XLPE cable segment with heat-shrinkable Raychem joints. Megger test verified RISO > 550 MΩ.",
            parts_replaced="15m 1.1kV XLPE Solar DC Cable, 2x Raychem Heat Shrink Joints",
            repair_duration_hours=4,
            status=VerificationStatus.APPROVED,
            verified_by_id=admin.id,
            verification_notes="Insulation test certificates and earth loop impedance readings fully verified.",
            submitted_at=datetime.now(timezone.utc) - timedelta(days=3),
            verified_at=datetime.now(timezone.utc) - timedelta(days=2)
        )
        db.add(evidence4)

        # Activity Logs
        act1 = ActivityLog(
            user_name="Priya Patel",
            action="FAULT_REPORTED",
            description="Reported MPPT Grid Voltage Fluctuation on M. Chinnaswamy Stadium Rooftop Solar Plant",
            entity_type="fault",
            entity_id=fault1.id,
            created_at=datetime.now(timezone.utc) - timedelta(hours=14)
        )
        act2 = ActivityLog(
            user_name="Rajesh Sharma",
            action="JOB_ASSIGNED",
            description=f"Ticket {fault1.ticket_number} assigned to Maintainer Arun Kumar",
            entity_type="assignment",
            entity_id=1,
            created_at=datetime.now(timezone.utc) - timedelta(hours=10)
        )
        act3 = ActivityLog(
            user_name="Rajesh Sharma",
            action="REPAIR_VERIFIED",
            description=f"Verified and closed Ticket {fault4.ticket_number} with approved Megger insulation proof",
            entity_type="fault",
            entity_id=fault4.id,
            created_at=datetime.now(timezone.utc) - timedelta(days=2)
        )
        db.add_all([act1, act2, act3])
        db.commit()

    logger.info("Real solar data populated successfully.")
