import os
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from prometheus_client import make_asgi_app, Counter, Histogram

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.api.v1.api import api_router
from app.api.v1.endpoints import health
from app.services.seed import seed_database
import app.models # Register all models with Base

# Prometheus Metrics
REQUEST_COUNT = Counter(
    "solarsync_http_requests_total",
    "Total HTTP Requests",
    ["method", "endpoint", "status"]
)
REQUEST_LATENCY = Histogram(
    "solarsync_http_request_duration_seconds",
    "HTTP Request Latency",
    ["method", "endpoint"]
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if not exist and seed initial demo data
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
    except Exception as e:
        print(f"[SolarSync Startup Warning] Database init/seed: {e}")
    yield
    # Shutdown logic if any


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
### SolarSync — Smart Solar Asset & Maintenance Management API ☀️⚡

Connecting Solar Installation Owners, Administrators, and Field Technicians.

**Key Endpoints:**
- **Geospatial Discovery**: `/api/v1/installations/nearby` (Radius search with PostGIS & Haversine math)
- **Role-Based Auth**: `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/me`
- **Fault Reporting**: `/api/v1/faults` (Photographic evidence & severity classification)
- **Maintenance Dispatch**: `/api/v1/maintenance/assignments`
- **Repair Verification**: `/api/v1/evidence` (Before/After photos sign-off loop)
- **Real-time Analytics**: `/api/v1/analytics/dashboard`
    """,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware - Support any origin (localhost, 127.0.0.1, LAN IP, or webview)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def prometheus_metrics_middleware(request: Request, call_next):
    start_time = time.time()
    method = request.method
    endpoint = request.url.path

    response = await call_next(request)

    if endpoint != "/metrics":
        duration = time.time() - start_time
        status_code = response.status_code
        REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=status_code).inc()
        REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(duration)

    return response


# Static files & Prometheus
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Include API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix="/health", tags=["Healthcheck"])


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to SolarSync Smart Solar Asset & Maintenance Management System API",
        "docs": "/docs",
        "health": "/health",
        "api_v1": settings.API_V1_STR,
        "version": settings.VERSION
    }
