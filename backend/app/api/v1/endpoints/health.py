from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db

router = APIRouter()


@router.get("", summary="System Healthcheck")
def check_health(db: Session = Depends(get_db)):
    """
    Performs real-time diagnostics on database and cache connectivity.
    Returns status: 'healthy' or 'degraded'.
    """
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unreachable: {str(e)}"

    redis_status = "standalone"
    if settings.REDIS_URL and ("localhost" in settings.REDIS_URL or "127.0.0.1" in settings.REDIS_URL):
        try:
            import redis
            r = redis.from_url(settings.REDIS_URL, socket_timeout=0.2, socket_connect_timeout=0.2)
            if r.ping():
                redis_status = "healthy"
        except Exception:
            redis_status = "offline (standalone dev mode)"

    overall_status = "healthy" if "healthy" in db_status else "degraded"

    return {
        "status": overall_status,
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "database": db_status,
            "redis": redis_status
        }
    }
