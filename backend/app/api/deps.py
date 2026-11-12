from typing import Generator, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to retrieve and validate the authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
    
    return user


def require_roles(allowed_roles: List[UserRole]):
    """Enforces Role-Based Access Control (RBAC) on protected endpoints."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.role
        
        # Check direct membership
        if user_role in allowed_roles:
            return current_user
            
        # Distributor privileges (inherits dispatching and assignment)
        if (UserRole.ADMIN in allowed_roles or UserRole.DISTRIBUTOR in allowed_roles) and user_role in [UserRole.DISTRIBUTOR, UserRole.ADMIN]:
            return current_user
            
        # Maintainer privileges (technician alias)
        if (UserRole.TECHNICIAN in allowed_roles or UserRole.MAINTAINER in allowed_roles) and user_role in [UserRole.TECHNICIAN, UserRole.MAINTAINER]:
            return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Operation not permitted. Required role: {[r.value for r in allowed_roles]}, your role: {current_user.role.value}"
        )
    return role_checker

