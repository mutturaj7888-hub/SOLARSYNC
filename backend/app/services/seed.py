import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.core.mongodb import save_user_to_mongodb, sync_sql_users_to_mongodb
from app.models.user import User, UserRole

logger = logging.getLogger("solarsync.seed")


def seed_database(db: Session, force_reload: bool = False):
    """
    Maintains clean database initialization.
    No dummy installations, fake faults, or mock telemetry are seeded.
    All installations and tickets are created dynamically by authentic users.
    """
    # Ensure default administrative accounts exist only if database has no users
    user_count = db.query(User).count()
    if user_count == 0:
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
        db.commit()
        db.refresh(distributor)
        save_user_to_mongodb({
            "id": distributor.id,
            "email": distributor.email,
            "hashed_password": distributor.hashed_password,
            "full_name": distributor.full_name,
            "phone_number": distributor.phone_number,
            "role": distributor.role.value if hasattr(distributor.role, 'value') else str(distributor.role),
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    sync_sql_users_to_mongodb(db)
    logger.info("Database initialized without dummy data.")
