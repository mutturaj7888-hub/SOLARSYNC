import os
from celery import Celery
from app.core.config import settings

celery = Celery(
    "solarsync_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.tasks"]
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    broker_connection_retry_on_startup=True,
    beat_schedule={
        "check-overdue-maintenance-every-hour": {
            "task": "app.workers.tasks.check_overdue_maintenance",
            "schedule": 3600.0,
        },
    }
)
