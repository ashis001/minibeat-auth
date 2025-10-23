from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from uuid import UUID
from app.db.database import get_db
from app.models.organization import Organization
from app.models.user import User
from app.schemas.organization import LicenseStatus
from app.core.security import verify_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/license", tags=["License"])
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


@router.get("/status", response_model=LicenseStatus)
async def get_license_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current organization license status"""
    
    organization = db.query(Organization).filter(
        Organization.id == current_user.organization_id
    ).first()
    
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Calculate days remaining
    days_remaining = (organization.license_expires_at - datetime.utcnow()).days
    
    # Count users
    user_count = db.query(User).filter(
        User.organization_id == organization.id,
        User.is_active == True
    ).count()
    
    return LicenseStatus(
        organization_id=organization.id,
        organization_name=organization.name,
        license_type=organization.license_type.value,
        is_valid=organization.is_license_valid(),
        expires_at=organization.license_expires_at,
        days_remaining=max(0, days_remaining),
        features_enabled=organization.features_enabled,
        max_users=organization.max_users,
        current_users=user_count
    )


@router.get("/check/{organization_id}")
async def check_organization_license(
    organization_id: UUID,
    db: Session = Depends(get_db)
):
    """Check if organization license is valid (for main app periodic checks)"""
    
    organization = db.query(Organization).filter(Organization.id == organization_id).first()
    
    if not organization:
        return {
            "valid": False,
            "reason": "organization_not_found"
        }
    
    if not organization.is_active:
        return {
            "valid": False,
            "reason": "organization_inactive"
        }
    
    if not organization.is_license_valid():
        return {
            "valid": False,
            "reason": "license_expired",
            "expires_at": organization.license_expires_at.isoformat()
        }
    
    return {
        "valid": True,
        "license_type": organization.license_type.value,
        "expires_at": organization.license_expires_at.isoformat(),
        "features": organization.features_enabled
    }
