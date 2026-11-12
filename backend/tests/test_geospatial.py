from app.services.geo import calculate_haversine_distance


def test_haversine_distance_calculation():
    # Bengaluru (12.9716, 77.5946) to Whitefield (12.9868, 77.7376) is approx 15.6 km
    dist = calculate_haversine_distance(12.9716, 77.5946, 12.9868, 77.7376)
    assert 14.0 <= dist <= 17.0

    # Distance to identical coordinate is 0
    dist_zero = calculate_haversine_distance(12.9716, 77.5946, 12.9716, 77.5946)
    assert dist_zero == 0.0


def test_nearby_installations_radius_filtering(client):
    # Register seed user & login
    reg = client.post("/api/v1/auth/register", json={
        "email": "geotester@solarsync.io",
        "password": "Password123!",
        "full_name": "Geo Tester",
        "role": "admin"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create near installation (MG Road ~ 2.6 km)
    client.post("/api/v1/installations", headers=headers, json={
        "name": "Nearby Solar Rooftop",
        "address": "MG Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "latitude": 12.9734,
        "longitude": 77.6186,
        "capacity_kw": 25.0,
        "installation_type": "rooftop_commercial"
    })

    # 2. Create far installation (Mysuru ~ 130 km)
    client.post("/api/v1/installations", headers=headers, json={
        "name": "Faraway Solar Farm",
        "address": "Ring Road",
        "city": "Mysuru",
        "state": "Karnataka",
        "latitude": 12.2958,
        "longitude": 76.6394,
        "capacity_kw": 500.0,
        "installation_type": "ground_mounted"
    })

    # 3. Query within 10 km from Bengaluru Center (12.9716, 77.5946)
    res_10k = client.get("/api/v1/installations/nearby?lat=12.9716&lng=77.5946&radius_km=10")
    assert res_10k.status_code == 200
    items_10k = res_10k.json()
    names_10k = [i["name"] for i in items_10k]

    assert "Nearby Solar Rooftop" in names_10k
    assert "Faraway Solar Farm" not in names_10k
    assert items_10k[0]["distance_km"] <= 10.0

    # 4. Query with large radius (150 km) includes Mysuru
    res_150k = client.get("/api/v1/installations/nearby?lat=12.9716&lng=77.5946&radius_km=150")
    assert res_150k.status_code == 200
    names_150k = [i["name"] for i in res_150k.json()]
    assert "Faraway Solar Farm" in names_150k

