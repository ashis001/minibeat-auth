from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.schemas.user import UserCreate, UserResponse, UserUpdate, UserWithOrganization
from app.schemas.organization import OrganizationResponse, OrganizationUpdate, OrganizationCreate
from app.core.security import get_password_hash, verify_token
from app.core.rbac import get_user_permissions
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/admin", tags=["Admin"])
security = HTTPBearer()


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Dependency to verify admin access"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.is_admin():
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return user


@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new user (Admin only)"""
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check organization exists
    organization = db.query(Organization).filter(Organization.id == user_data.organization_id).first()
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Check user limit
    current_users = db.query(User).filter(
        User.organization_id == user_data.organization_id,
        User.is_active == True
    ).count()
    
    if current_users >= organization.max_users:
        raise HTTPException(
            status_code=400,
            detail=f"Organization has reached maximum user limit ({organization.max_users})"
        )
    
    # Create user
    new_user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=UserRole(user_data.role),
        organization_id=user_data.organization_id,
        created_by=current_admin.id
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Get permissions
    permissions = get_user_permissions(new_user.role)
    
    response = UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role.value,
        organization_id=new_user.organization_id,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
        last_login=new_user.last_login,
        permissions=permissions
    )
    
    return response


@router.get("/users", response_model=List[UserWithOrganization])
async def list_users(
    organization_id: UUID = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all users (Admin only) - excludes system admins from organization lists"""
    
    query = db.query(User).join(Organization)
    
    # Exclude ADMIN role users (system admins) from organization user lists
    query = query.filter(User.role != UserRole.ADMIN)
    
    if organization_id:
        query = query.filter(User.organization_id == organization_id)
    
    users = query.all()
    
    result = []
    for user in users:
        permissions = get_user_permissions(user.role)
        result.append(UserWithOrganization(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role.value,
            organization_id=user.organization_id,
            is_active=user.is_active,
            created_at=user.created_at,
            last_login=user.last_login,
            permissions=permissions,
            organization_name=user.organization.name,
            license_expires_at=user.organization.license_expires_at,
            features_enabled=user.organization.features_enabled
        ))
    
    return result


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update user (Admin only)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    if user_data.full_name is not None:
        user.full_name = user_data.full_name
    
    if user_data.role is not None:
        user.role = UserRole(user_data.role)
    
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    
    db.commit()
    db.refresh(user)
    
    permissions = get_user_permissions(user.role)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        organization_id=user.organization_id,
        is_active=user.is_active,
        created_at=user.created_at,
        last_login=user.last_login,
        permissions=permissions
    )


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: UUID,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete user (Admin only)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting yourself
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}


@router.post("/organizations", response_model=OrganizationResponse)
async def create_organization(
    org_data: OrganizationCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new organization (Admin only)"""
    
    # Check if name exists
    existing_org = db.query(Organization).filter(Organization.name == org_data.name).first()
    if existing_org:
        raise HTTPException(status_code=400, detail="Organization name already exists")
    
    new_org = Organization(
        name=org_data.name,
        license_type=org_data.license_type,
        license_expires_at=org_data.license_expires_at,
        max_users=org_data.max_users,
        features_enabled=org_data.features_enabled,
        allowed_ips=org_data.allowed_ips
    )
    
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    
    return OrganizationResponse(
        id=new_org.id,
        name=new_org.name,
        license_type=new_org.license_type.value,
        license_expires_at=new_org.license_expires_at,
        max_users=new_org.max_users,
        features_enabled=new_org.features_enabled,
        allowed_ips=new_org.allowed_ips,
        is_active=new_org.is_active,
        created_at=new_org.created_at,
        user_count=0
    )


@router.get("/organizations", response_model=List[OrganizationResponse])
async def list_organizations(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all organizations (Admin only)"""
    
    organizations = db.query(Organization).all()
    
    result = []
    for org in organizations:
        user_count = db.query(User).filter(
            User.organization_id == org.id,
            User.is_active == True
        ).count()
        
        result.append(OrganizationResponse(
            id=org.id,
            name=org.name,
            license_type=org.license_type.value,
            license_expires_at=org.license_expires_at,
            max_users=org.max_users,
            features_enabled=org.features_enabled,
            allowed_ips=org.allowed_ips,
            is_active=org.is_active,
            created_at=org.created_at,
            user_count=user_count
        ))
    
    return result


@router.patch("/organizations/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: UUID,
    org_data: OrganizationUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update organization (Admin only)"""
    
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Update fields
    if org_data.name is not None:
        org.name = org_data.name
    
    if org_data.license_type is not None:
        org.license_type = org_data.license_type
    
    if org_data.license_expires_at is not None:
        org.license_expires_at = org_data.license_expires_at
    
    if org_data.max_users is not None:
        org.max_users = org_data.max_users
    
    if org_data.features_enabled is not None:
        org.features_enabled = org_data.features_enabled
    
    if org_data.allowed_ips is not None:
        org.allowed_ips = org_data.allowed_ips
    
    if org_data.is_active is not None:
        org.is_active = org_data.is_active
    
    db.commit()
    db.refresh(org)
    
    user_count = db.query(User).filter(
        User.organization_id == org.id,
        User.is_active == True
    ).count()
    
    return OrganizationResponse(
        id=org.id,
        name=org.name,
        license_type=org.license_type.value,
        license_expires_at=org.license_expires_at,
        max_users=org.max_users,
        features_enabled=org.features_enabled,
        allowed_ips=org.allowed_ips,
        is_active=org.is_active,
        created_at=org.created_at,
        user_count=user_count
    )
