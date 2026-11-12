# SolarSync ☀️⚡
### Smart Solar Asset & Maintenance Management System

SolarSync is a production-grade web platform connecting **Solar Installation Owners**, **Administrators**, and **Maintenance Technicians** to streamline solar asset discovery, health monitoring, fault ticketing, automated job scheduling, and verified repair workflows.

---

## 🌟 Key Features

1. **Interactive Geospatial Map (Leaflet + OpenStreetMap + PostGIS)**:
   - Live browser geolocation and radius filtering (5 km, 10 km, 25 km, 50 km).
   - Marker clustering, operational status indicators, and side-by-side asset drawer.
   - Authorised installation registration by clicking map coordinates.
   - Nominatim geocoding search by city or locality.

2. **Role-Based Access Control (RBAC)**:
   - **Administrator**: Global asset management, technician allocation, SLA monitoring, and system metrics.
   - **Installation Owner**: Asset registration, fault submission with photos, and repair verification.
   - **Technician**: Mobile-ready job dashboard, status updates, and before/after repair evidence submission.

3. **Smart Maintenance & Automation**:
   - Asynchronous job queue powered by **Celery** and **Redis**.
   - Automated preventive maintenance inspection alerts.
   - Overdue maintenance detection and assignment notifications.

4. **Fault Reporting & Verified Repair**:
   - Categorised fault ticketing with severity grading and photo uploads.
   - Proof-of-work verification loop (technician evidence submission → owner/admin sign-off or reopening).

5. **Analytics & Insights**:
   - MTTR (Mean Time to Repair), fault frequency by equipment, technician workload distribution, and maintenance completion metrics.

6. **DevOps & Observability**:
   - Containerized multi-service deployment with Docker Compose.
   - Prometheus metrics endpoint & Grafana monitoring dashboard.
   - GitHub Actions CI for linting, security scans (Trivy), and automated testing.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Lucide Icons, Leaflet / React-Leaflet, Tailwind CSS |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| **Database** | PostgreSQL 16 with PostGIS spatial extension |
| **Worker & Queue** | Celery 5.4, Redis 7 |
| **Authentication** | JWT (JSON Web Tokens), OAuth2 Password Bearer, Bcrypt password hashing |
| **Testing** | Pytest, HTTPX, Playwright E2E |
| **DevOps & Monitoring**| Docker, Docker Compose, Prometheus, Grafana, Trivy |

---

## 🚀 Quick Start with Docker Compose

Ensure Docker and Docker Compose are installed on your machine, then run:

```bash
# 1. Clone repository & change directory
cd SolarSync

# 2. Copy environment configuration
cp .env.example .env

# 3. Build and launch all services in detached mode
docker-compose up --build -d

# 4. Verify running containers
docker-compose ps
```

### Service Access URLs
- **Web Frontend**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend & Interactive API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Healthcheck**: [http://localhost:8000/health](http://localhost:8000/health)
- **Prometheus Dashboard**: [http://localhost:9090](http://localhost:9090)
- **Grafana Metrics**: [http://localhost:3001](http://localhost:3001) *(default login: admin / admin)*

---

## 💻 Local Development Setup

### Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
pytest -v

# Run with coverage report
pytest --cov=app tests/
```

---

## 🛡️ Security & Environment Best Practices
- Never commit `.env` or files containing private credentials.
- All file uploads are validated for MIME type, extension, and file size limits.
- Sensitive passwords are encrypted using Bcrypt with a high work factor.

---

## 📄 License
SolarSync is distributed under the MIT License.
