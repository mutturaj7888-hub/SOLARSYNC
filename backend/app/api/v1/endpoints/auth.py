import re
import math
from datetime import timedelta, datetime, timezone
from typing import List, Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.mongodb import (
    save_user_to_mongodb,
    find_user_in_mongodb,
    list_users_from_mongodb,
    is_mongodb_connected,
    sync_sql_users_to_mongodb,
    MONGODB_URL,
    MONGODB_DB_NAME
)
from app.models.user import User, UserRole
from app.models.fault import FaultReport
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.api.deps import get_current_user

def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine formula to compute great circle distance in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

router = APIRouter()


@router.get("/mongodb-status", summary="Check MongoDB Connection and Stored Users")
def get_mongo_status(db: Session = Depends(get_db)):
    """Verifies that user login details are stored and active in MongoDB."""
    connected = is_mongodb_connected()
    if connected:
        sync_sql_users_to_mongodb(db)
    
    users = list_users_from_mongodb() if connected else []
    return {
        "connected": connected,
        "database_url": MONGODB_URL,
        "database_name": MONGODB_DB_NAME,
        "collection": "users",
        "total_users_stored": len(users),
        "users": users
    }


@router.post("/register", response_model=Token, summary="Register New User Account with Name and Password")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user by Name and Password.
    Stores login details in MongoDB collection 'users' and mirrors to SQL database.
    """
    display_name = (user_in.name or user_in.full_name or user_in.username or "").strip()
    if not display_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide your name or username to register"
        )

    if not user_in.password or len(user_in.password.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 3 characters long"
        )

    # Clean / derive email address
    raw_email = (user_in.email or "").strip().lower()
    if not raw_email or "@" not in raw_email:
        clean_slug = re.sub(r'[^a-z0-9]', '', display_name.lower()) or "user"
        email_clean = f"{clean_slug}@solarsync.io"
    else:
        email_clean = raw_email

    # Check for existing user by email or full_name
    existing_sql = db.query(User).filter(
        (func.lower(User.email) == email_clean) | 
        (func.lower(User.full_name) == display_name.lower())
    ).first()
    existing_mongo = find_user_in_mongodb(email_clean) or find_user_in_mongodb(display_name)

    if existing_sql or existing_mongo:
        # Check if the user is attempting to re-register with same password
        existing_hash = (existing_sql.hashed_password if existing_sql else None) or (existing_mongo.get("hashed_password") if existing_mongo else None)
        if existing_hash and verify_password(user_in.password, existing_hash):
            user_id = existing_sql.id if existing_sql else 1
            user_role = existing_sql.role if existing_sql else UserRole(existing_mongo.get("role", "installation_owner"))
            token = create_access_token(subject=user_id, role=user_role.value if hasattr(user_role, 'value') else str(user_role))
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": existing_sql or {
                    "id": user_id,
                    "email": email_clean,
                    "full_name": display_name,
                    "role": user_role,
                    "is_active": True,
                    "is_verified": True,
                    "created_at": datetime.now(timezone.utc)
                }
            }
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with the name '{display_name}' or email '{email_clean}' already exists. Please sign in."
        )

    hashed_pwd = get_password_hash(user_in.password)
    assigned_role = user_in.role or UserRole.INSTALLATION_OWNER
    role_val = assigned_role.value if hasattr(assigned_role, 'value') else str(assigned_role)

    # 1. Save user in SQL database with location data
    user = User(
        email=email_clean,
        hashed_password=hashed_pwd,
        full_name=display_name,
        phone_number=user_in.phone_number or "+91 98450 12345",
        role=assigned_role,
        latitude=user_in.latitude,
        longitude=user_in.longitude,
        city=user_in.city,
        address=user_in.address,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Store login credentials and profile in MongoDB
    save_user_to_mongodb({
        "id": user.id,
        "email": email_clean,
        "username": display_name.lower().replace(' ', ''),
        "hashed_password": hashed_pwd,
        "full_name": display_name,
        "phone_number": user.phone_number,
        "role": role_val,
        "latitude": user_in.latitude,
        "longitude": user_in.longitude,
        "city": user_in.city,
        "address": user_in.address,
        "is_active": True,
        "is_verified": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    token = create_access_token(subject=user.id, role=user.role.value)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login", response_model=Token, summary="Authenticate with Name or Email and Password")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate with Name, Username, or Email and Password.
    Queries MongoDB for credentials, with synchronized fallback.
    """
    identifier = (
        credentials.username_or_email or 
        credentials.name or 
        credentials.username or 
        credentials.email or 
        ""
    ).strip()

    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter your name, username, or email address"
        )

    # 1. Query MongoDB for user credentials (matches name, username, or email)
    mongo_user = find_user_in_mongodb(identifier)

    # 2. Query SQL for user (matches email or full_name)
    user = db.query(User).filter(
        (func.lower(User.email) == identifier.lower()) | 
        (func.lower(User.full_name) == identifier.lower())
    ).first()

    # If user not found in either PostgreSQL or MongoDB, inform that user doesn't exist
    if not user and not mongo_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User doesn't exist. Please register first."
        )

    # Determine stored password hash
    hashed_pwd = None
    if mongo_user and "hashed_password" in mongo_user:
        hashed_pwd = mongo_user["hashed_password"]
    elif user:
        hashed_pwd = user.hashed_password

    if not hashed_pwd or not verify_password(credentials.password, hashed_pwd):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please try again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # If found in MongoDB but not in SQL, mirror into SQL so relations work
    if not user and mongo_user:
        role_val = mongo_user.get("role", "installation_owner")
        try:
            role_enum = UserRole(role_val)
        except Exception:
            role_enum = UserRole.INSTALLATION_OWNER

        user = User(
            email=mongo_user.get("email") or f"{identifier.lower().replace(' ', '')}@solarsync.io",
            hashed_password=hashed_pwd,
            full_name=mongo_user.get("full_name") or identifier,
            phone_number=mongo_user.get("phone_number", ""),
            role=role_enum,
            is_active=mongo_user.get("is_active", True),
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user and not mongo_user:
        # Sync SQL user into MongoDB
        save_user_to_mongodb({
            "id": user.id,
            "email": user.email,
            "username": user.full_name.lower().replace(' ', ''),
            "hashed_password": user.hashed_password,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat() if user.created_at else None
        })

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled")

    token = create_access_token(subject=user.id, role=user.role.value)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/token", response_model=Token, summary="OAuth2 Form Compatible Login")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Standard OAuth2 password bearer form login for Swagger UI."""
    return login(UserLogin(username_or_email=form_data.username, password=form_data.password), db)


@router.get("/me", response_model=UserOut, summary="Get Current Authenticated Profile")
def read_current_user(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile and active role."""
    return current_user


@router.get("/technicians", response_model=List[UserOut], summary="List Field Technicians")
def list_technicians(
    fault_id: Optional[int] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns list of maintainers / technicians for maintenance job assignments.
    If fault_id (or lat/lng) is provided, calculates distance to the resident's solar installation
    so the distributor can choose the nearest maintainer to the resident for repair.
    """
    technicians = db.query(User).filter(
        User.role.in_([UserRole.TECHNICIAN, UserRole.MAINTAINER]),
        User.is_active == True
    ).all()

    ref_lat = lat
    ref_lng = lng

    if fault_id and (ref_lat is None or ref_lng is None):
        fault = db.query(FaultReport).filter(FaultReport.id == fault_id).first()
        if fault and fault.installation:
            ref_lat = fault.installation.latitude
            ref_lng = fault.installation.longitude

    results = []
    for t in technicians:
        out = UserOut.model_validate(t)
        if ref_lat is not None and ref_lng is not None and t.latitude is not None and t.longitude is not None:
            out.distance_km = calculate_distance_km(ref_lat, ref_lng, t.latitude, t.longitude)
        else:
            out.distance_km = None
        results.append(out)

    results.sort(key=lambda x: (x.distance_km is None, x.distance_km or 999999))
    return results


@router.get("/distributors", response_model=List[UserOut], summary="List Certified Solar Distributors")
def list_distributors(
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    installation_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns list of certified distributors.
    If lat and lng (or installation_id) are provided, computes distance so the resident can choose their nearest distributor.
    """
    distributors = db.query(User).filter(
        User.role.in_([UserRole.DISTRIBUTOR, UserRole.ADMIN]),
        User.is_active == True
    ).all()

    ref_lat = lat
    ref_lng = lng

    if installation_id and (ref_lat is None or ref_lng is None):
        from app.models.installation import SolarInstallation
        inst = db.query(SolarInstallation).filter(SolarInstallation.id == installation_id).first()
        if inst:
            ref_lat = inst.latitude
            ref_lng = inst.longitude

    if ref_lat is None and ref_lng is None and current_user.latitude and current_user.longitude:
        ref_lat = current_user.latitude
        ref_lng = current_user.longitude

    results = []
    for d in distributors:
        out = UserOut.model_validate(d)
        if ref_lat is not None and ref_lng is not None and d.latitude is not None and d.longitude is not None:
            out.distance_km = calculate_distance_km(ref_lat, ref_lng, d.latitude, d.longitude)
        else:
            out.distance_km = None
        results.append(out)

    results.sort(key=lambda x: (x.distance_km is None, x.distance_km or 999999))
    return results
