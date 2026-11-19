import logging
from sqlalchemy.orm import Session

logger = logging.getLogger("solarsync.seed")


def seed_database(db: Session, force_reload: bool = False):
    """
    Maintains clean database initialization.
    No default credentials or dummy installations are created.
    Users register authentically via the registration form.
    """
    logger.info("Database initialized without pre-seeded credentials.")
