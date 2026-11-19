from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.installation import SolarInstallation, Equipment, OperationalStatus
from app.models.activity import ActivityLog
from app.schemas.installation import (
    InstallationCreate,
    InstallationUpdate,
    InstallationOut,
    EquipmentCreate,
    EquipmentOut
)
from app.services.geo import search_nearby_installations, calculate_haversine_distance
from app.api.deps import get_current_user, require_roles

router = APIRouter()


@router.get("", response_model=List[InstallationOut], summary="List All Solar Installations")
def get_installations(
    city: Optional[str] = None,
    status: Optional[str] = None,
    owner_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve registered installations. Residents strictly see only their own registered solar panels."""
    query = db.query(SolarInstallation)
    
    # Restrict resident access to only their own registered solar panels
    if current_user.role == UserRole.INSTALLATION_OWNER:
        query = query.filter(SolarInstallation.owner_id == current_user.id)
    elif owner_id:
        query = query.filter(SolarInstallation.owner_id == owner_id)

    if city:
        query = query.filter(SolarInstallation.city.ilike(f"%{city}%"))
    if status and status != "all":
        query = query.filter(SolarInstallation.operational_status == status)
    
    installations = query.offset(skip).limit(limit).all()
    return installations


@router.get("/nearby", response_model=List[InstallationOut], summary="Find Solar Installations Near Coordinates")
def get_nearby_installations(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Center latitude"),
    lng: float = Query(..., ge=-180.0, le=180.0, description="Center longitude"),
    radius_km: float = Query(10.0, ge=1.0, le=500.0, description="Search radius in kilometers"),
    status: Optional[str] = Query(None, description="Filter by operational status"),
    db: Session = Depends(get_db)
):
    """
    Geospatial discovery endpoint using PostGIS bounding and Haversine distance math.
    Returns only installations located within the specified radius.
    """
    pairs = search_nearby_installations(
        db=db,
        latitude=lat,
        longitude=lng,
        radius_km=radius_km,
        status=status
    )
    
    results = []
    for inst, dist in pairs:
        # Attach dynamic distance property
        inst_out = InstallationOut.model_validate(inst)
        inst_out.distance_km = dist
        results.append(inst_out)
    return results


@router.get("/{installation_id}", response_model=InstallationOut, summary="Get Solar Installation Details")
def get_installation(installation_id: int, db: Session = Depends(get_db)):
    """Fetch details and equipment inventory for an installation."""
    inst = db.query(SolarInstallation).filter(SolarInstallation.id == installation_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Solar installation not found")
    return inst


@router.post("", response_model=InstallationOut, summary="Register New Solar Installation")
def create_installation(
    inst_in: InstallationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.INSTALLATION_OWNER, UserRole.ADMIN]))
):
    """Authorised users register rooftop or commercial solar assets by providing specs and coordinates."""
    inst = SolarInstallation(
        name=inst_in.name,
        address=inst_in.address,
        city=inst_in.city,
        state=inst_in.state,
        postal_code=inst_in.postal_code,
        latitude=inst_in.latitude,
        longitude=inst_in.longitude,
        capacity_kw=inst_in.capacity_kw,
        installation_type=inst_in.installation_type,
        operational_status=inst_in.operational_status,
        commissioning_date=inst_in.commissioning_date,
        is_demo_data=inst_in.is_demo_data,
        owner_id=current_user.id
    )
    db.add(inst)
    db.commit()
    db.refresh(inst)

    # Attach equipment specifications if provided
    if inst_in.equipment:
        for eq in inst_in.equipment:
            db_eq = Equipment(
                installation_id=inst.id,
                equipment_type=eq.equipment_type,
                manufacturer=eq.manufacturer,
                model_number=eq.model_number,
                serial_number=eq.serial_number,
                capacity_rating=eq.capacity_rating,
                warranty_expiry=eq.warranty_expiry,
                status=eq.status
            )
            db.add(db_eq)
        db.commit()
        db.refresh(inst)

    # Log activity
    log = ActivityLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="INSTALLATION_REGISTERED",
        description=f"Registered solar asset '{inst.name}' ({inst.capacity_kw} kW) in {inst.city}",
        entity_type="installation",
        entity_id=inst.id
    )
    db.add(log)
    db.commit()

    return inst


@router.put("/{installation_id}", response_model=InstallationOut, summary="Update Solar Installation")
def update_installation(
    installation_id: int,
    inst_update: InstallationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update details of a solar installation."""
    inst = db.query(SolarInstallation).filter(SolarInstallation.id == installation_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Solar installation not found")
    
    if current_user.role != UserRole.ADMIN and inst.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this installation")

    for field, value in inst_update.model_dump(exclude_unset=True).items():
        setattr(inst, field, value)

    db.commit()
    db.refresh(inst)
    return inst


@router.delete("/{installation_id}", summary="Delete Solar Installation")
def delete_installation(
    installation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a solar installation record."""
    inst = db.query(SolarInstallation).filter(SolarInstallation.id == installation_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Solar installation not found")
    
    if current_user.role != UserRole.ADMIN and inst.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this installation")

    db.delete(inst)
    db.commit()
    return {"status": "success", "message": f"Installation {installation_id} deleted"}

