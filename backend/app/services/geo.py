import math
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.installation import SolarInstallation, OperationalStatus


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes distance between two geographic coordinates (lat, lon) in kilometers
    using the Haversine formula (Earth mean radius = 6371.0 km).
    """
    # Convert degrees to radians
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    distance_km = 6371.0 * c
    return round(distance_km, 2)


def get_bounding_box(lat: float, lon: float, radius_km: float) -> Tuple[float, float, float, float]:
    """Returns (min_lat, max_lat, min_lon, max_lon) bounding box for fast indexing."""
    # 1 deg latitude ≈ 111 km
    lat_delta = radius_km / 111.0
    # 1 deg longitude ≈ 111 km * cos(lat)
    lon_delta = radius_km / (111.0 * math.cos(math.radians(lat))) if math.cos(math.radians(lat)) != 0 else radius_km / 111.0

    return (lat - lat_delta, lat + lat_delta, lon - lon_delta, lon + lon_delta)


def search_nearby_installations(
    db: Session,
    latitude: float,
    longitude: float,
    radius_km: float = 10.0,
    status: Optional[str] = None
) -> List[Tuple[SolarInstallation, float]]:
    """
    Queries installations within radius_km, computes geodesic distance,
    and returns a sorted list of (installation, distance_km).
    """
    min_lat, max_lat, min_lon, max_lon = get_bounding_box(latitude, longitude, radius_km)

    query = db.query(SolarInstallation).filter(
        SolarInstallation.latitude >= min_lat,
        SolarInstallation.latitude <= max_lat,
        SolarInstallation.longitude >= min_lon,
        SolarInstallation.longitude <= max_lon,
    )

    if status and status != "all":
        query = query.filter(SolarInstallation.operational_status == status)

    candidates = query.all()

    # Precise distance filtering
    results = []
    for inst in candidates:
        dist = calculate_haversine_distance(latitude, longitude, inst.latitude, inst.longitude)
        if dist <= radius_km:
            results.append((inst, dist))

    # Sort nearest first
    results.sort(key=lambda x: x[1])
    return results

