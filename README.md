# SolarSync ☀️⚡
### Autonomous Distributed Solar Maintenance & Task Dispatch Network

SolarSync is a modern, dark-minimalist web platform designed for solar energy infrastructure management. Built around a role-based architecture—**Distributors**, **Maintainers**, and **Nearby Residents**—SolarSync eliminates centralized administrator bottlenecks in favor of local community request routing, field technician dispatch, and automated fault resolution.

The interface features an **ECHOID-inspired dark minimalist aesthetic** powered by Google Fonts (Sora & JetBrains Mono), sharp 0px geometry, and a **photorealistic 3D Sun simulation** in Three.js with dynamic plasma convection shaders and spherical coronal atmospheres.

---

## 🌟 Key Architecture & Highlights

### 1. Zero-Admin Distributed Workflow
- **📡 Distributor (Task Assigner)**:
  - Triage problem requests submitted by nearby solar array owners.
  - Dispatch tasks to specialized field maintainers with SLA priorities and geographic awareness.
  - Review photographic proof-of-work before formal job sign-off.
- **🔧 Maintainer (Field Specialist)**:
  - Receive assigned maintenance orders directly on a mobile-ready console.
  - Track active job timers, record replaced components, and submit before/after photo evidence.
  - Quick-resolve single tickets or perform bulk verification.
- **🏡 Nearby Resident (Solar Array Owner)**:
  - Register rooftop and commercial solar installations with geographic coordinates.
  - Submit equipment failure tickets (inverter drops, panel hotspots, wiring degradation) with photographic evidence.
  - Monitor repair status in real time.

### 2. Photorealistic 3D Dynamic Sun Simulation (Three.js)
- **Procedural Photosphere Convection Shader**:
  - Multi-octave Simplex noise simulates boiling, bubbling solar plasma cells.
  - Physical color gradation: Thermal Core (`#FFF5BF`) → Chromosphere Gold (`#FFA60D`) → Convection Crimson (`#F24705`) → Limb-darkened edges.
- **Volumetric Spherical Coronal Halos**:
  - Four concentric atmospheric layers utilizing additive blending (`THREE.AdditiveBlending`).
  - True spherical stellar geometry without planetary rings or distortion.
- **Radial Solar Prominences & Outflow**:
  - Arched coronal plasma loops erupting organically from the solar surface.
  - 2,000 spherical photon & solar wind particles streaming in 360° space.
- **Interactive Orbital Telemetry Beacons**:
  - Interactive nodes for Distributor Hub, Active Maintainers, and Nearby Requests.
  - Mouse hover displays live telemetry HUD; click-to-dispatch navigates directly to work orders.

### 3. Fault Management & Instant Resolution Suite
- **Comprehensive Incident Tracking**:
  - Severity classification (Critical P1, High P2, Medium P3, Low P4).
  - Photographic evidence capture and storage.
- **Batch Resolution**:
  - 1-click `REPAIR ALL FAULTS` endpoint (`POST /api/v1/faults/repair-all`) restores entire solar fleet health to `OPERATIONAL` in seconds.
  - Individual `Repair & Close` button on every active incident card.

### 4. Minimalist Dark Identity & Auth Portal
- Pure `#000000` background with Sora 200/300 display typography and JetBrains Mono terminal metrics.
- Seamless dual-mode authentication: `01 // SIGN IN` and `02 // REGISTER`.
- Direct 1-Click instant sign-in presets for Distributor, Maintainer, and Resident personas.
- Dual storage synchronization: persistent MongoDB user records with SQLite/PostgreSQL fallback.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Three.js, Lucide Icons, Leaflet / React-Leaflet, Axios |
| **Styling & Typography** | Google Fonts (Sora, JetBrains Mono), Pure CSS Variables, 0px Sharp Aesthetics |
| **Backend API** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn |
| **Data Layer** | PostgreSQL 16 (PostGIS) / SQLite Fallback, MongoDB credential mirroring |
| **Asynchronous Engine** | Celery 5.4, Redis 7 |
| **Observability & Metrics** | Prometheus HTTP metrics, Grafana dashboards |

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- (Optional) Docker and Docker Compose

### 1. Clone & Setup Repository
```bash
git clone https://github.com/nagarajd11/SOLARSYNC.git
cd SOLARSYNC
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at: **http://localhost:8000/docs**

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev -- --host 0.0.0.0 --port 5173
```
Web application will be accessible at: **http://localhost:5173**

---

## 🌐 Application Route Map

| Path | Description | Access |
|---|---|---|
| `/` | Interactive 3D Sun Landing & Role Selector | Public |
| `/login` | High-Precision Authentication & Registration Portal | Public |
| `/dashboard` | Operational Console & Fleet Metrics Ribbon | Authenticated |
| `/maintenance` | Distributor Dispatch Queue & Work Order Management | Distributor / Maintainer |
| `/faults` | Incident Reports & Batch "Repair All Faults" Suite | All Roles |
| `/map` | Geospatial Fleet Discovery & Asset Registration | Authenticated |
| `/assets` | PV Inverter, String, and Battery Asset Registry | Authenticated |
| `/analytics` | Mean Time to Repair (MTTR) & Workload Telemetry | Authenticated |
| `/3d` | Full-Screen 3D Solar Matrix Explorer | Public |

---

## 👤 Default Demo Credentials

For quick evaluation, use the 1-click sign-in buttons on `/login` or enter:

| Persona | Email / Identifier | Password | Role Description |
|---|---|---|---|
| **Distributor** | `distributor@solarsync.io` | `SolarDist123!` | Assigns maintenance tasks from nearby requests |
| **Maintainer** | `tech@solarsync.io` | `SolarTech123!` | Receives assignments, uploads repair proof |
| **Resident** | `owner@solarsync.io` | `SolarOwner123!` | Nearby solar owner reporting equipment faults |

---

## 📜 License
MIT License. Created for smart, decentralized clean energy management.
