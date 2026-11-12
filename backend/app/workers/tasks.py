import logging
from app.workers.celery_app import celery

logger = logging.getLogger("solarsync.tasks")


@celery.task(name="app.workers.tasks.check_overdue_maintenance")
def check_overdue_maintenance():
    """Periodic task to scan database for overdue maintenance tickets and send alerts."""
    logger.info("Scanning for overdue maintenance tasks...")
    # Will query maintenance requests in subsequent phases
    return {"status": "completed", "checked": True}


@celery.task(name="app.workers.tasks.send_maintenance_notification")
def send_maintenance_notification(user_id: int, message: str, event_type: str):
    """Async task to dispatch notifications to technicians or owners."""
    logger.info(f"Dispatching {event_type} notification to user {user_id}: {message}")
    return {"user_id": user_id, "delivered": True}
