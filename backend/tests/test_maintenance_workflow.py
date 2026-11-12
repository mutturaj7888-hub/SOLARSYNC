def test_complete_solar_maintenance_lifecycle(client):
    # Step 1: Create Admin, Owner, and Technician
    admin_res = client.post("/api/v1/auth/register", json={
        "email": "lifecycle_admin@solarsync.io",
        "password": "Password123!",
        "full_name": "Lifecycle Admin",
        "role": "admin"
    })
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    owner_res = client.post("/api/v1/auth/register", json={
        "email": "lifecycle_owner@solarsync.io",
        "password": "Password123!",
        "full_name": "Lifecycle Owner",
        "role": "installation_owner"
    })
    owner_token = owner_res.json()["access_token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    tech_res = client.post("/api/v1/auth/register", json={
        "email": "lifecycle_tech@solarsync.io",
        "password": "Password123!",
        "full_name": "Lifecycle Tech",
        "role": "technician"
    })
    tech_token = tech_res.json()["access_token"]
    tech_id = tech_res.json()["user"]["id"]
    tech_headers = {"Authorization": f"Bearer {tech_token}"}

    # Step 2: Owner registers a solar installation
    inst_res = client.post("/api/v1/installations", headers=owner_headers, json={
        "name": "Koramangala Rooftop System",
        "address": "12 Main St, Koramangala",
        "city": "Bengaluru",
        "state": "Karnataka",
        "latitude": 12.9352,
        "longitude": 77.6245,
        "capacity_kw": 20.0,
        "installation_type": "rooftop_commercial"
    })
    assert inst_res.status_code == 200
    inst_id = inst_res.json()["id"]

    # Step 3: Owner reports a critical fault
    fault_res = client.post("/api/v1/faults", headers=owner_headers, json={
        "installation_id": inst_id,
        "title": "Inverter DC Bus Overvoltage",
        "description": "DC input voltage spiked above 600V causing auto shutoff.",
        "category": "inverter_failure",
        "severity": "critical",
        "photo_url": "https://example.com/hotspot.jpg"
    })
    assert fault_res.status_code == 200
    fault_id = fault_res.json()["id"]
    assert fault_res.json()["status"] == "reported"

    # Step 4: Administrator assigns maintenance job to technician
    assign_res = client.post("/api/v1/maintenance/assignments", headers=admin_headers, json={
        "fault_report_id": fault_id,
        "technician_id": tech_id,
        "priority": "emergency",
        "dispatch_notes": "Inspect MPPT tracker 2 and DC isolator switch."
    })
    assert assign_res.status_code == 200
    assign_id = assign_res.json()["id"]

    # Step 5: Technician starts the job
    start_res = client.put(f"/api/v1/maintenance/assignments/{assign_id}/progress", headers=tech_headers, json={
        "status": "started"
    })
    assert start_res.status_code == 200

    # Step 6: Technician submits repair evidence (before and after photos)
    evidence_res = client.post("/api/v1/evidence", headers=tech_headers, json={
        "fault_report_id": fault_id,
        "before_photo_url": "https://example.com/burnt_fuse.jpg",
        "after_photo_url": "https://example.com/new_fuse_installed.jpg",
        "work_summary": "Replaced 1000V DC surge protection device and fuse block.",
        "parts_replaced": "1000V 32A DC Fuse Block",
        "repair_duration_hours": 2
    })
    assert evidence_res.status_code == 200
    evidence_id = evidence_res.json()["id"]
    assert evidence_res.json()["status"] == "pending_review"

    # Step 7: Owner verifies the repair with photographic proof
    verify_res = client.post(f"/api/v1/evidence/{evidence_id}/verify", headers=owner_headers, json={
        "approved": True,
        "verification_notes": "Reviewed photographic proof. Inverter back online producing 18.2 kW."
    })
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "approved"

    # Step 8: Verify Fault is now CLOSED and dashboard reports the verified repair
    fault_check = client.get(f"/api/v1/faults/{fault_id}", headers=owner_headers)
    assert fault_check.status_code == 200
    assert fault_check.json()["status"] == "verified_closed"
    assert fault_check.json()["resolved_at"] is not None

    # Step 9: Analytics summary verification
    analytics_res = client.get("/api/v1/analytics/dashboard")
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert analytics_data["total_installations"] >= 1
    assert analytics_data["verified_repairs_count"] >= 1

