from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.db.database import get_db, get_redis
from app.models.user import User
from app.models.organization import Organization
from app.models.audit_log import AuditLog, AuditAction
from app.schemas.auth import LoginRequest, Token, RefreshTokenRequest, ValidateTokenRequest, ValidateTokenResponse
from app.core.security import create_access_token, create_refresh_token, verify_password, verify_token
from app.core.permissions import get_user_permissions
from app.core.middleware import get_client_ip, check_ip_whitelist

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    credentials: LoginRequest,
    db: Session = Depends(get_db),
    redis=Depends(get_redis)
):
    """Login endpoint - returns access and refresh tokens"""
    
    # Get client IP
    client_ip = get_client_ip(request)
    
    # Find user
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        # Log failed login attempt
        audit_log = AuditLog(
            action=AuditAction.LOGIN_FAILED,
            user_email=credentials.email,
            organization_id=user.organization_id if user else None,
            ip_address=client_ip,
            user_agent=request.headers.get("User-Agent"),
            status="failed",
            error_message="Invalid email or password",
            details={"reason": "invalid_credentials", "email": credentials.email}
        )
        db.add(audit_log)
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.is_active:
        # Log failed login - inactive user
        audit_log = AuditLog(
            action=AuditAction.LOGIN_FAILED,
            user_id=user.id,
            user_email=user.email,
            organization_id=user.organization_id,
            ip_address=client_ip,
            user_agent=request.headers.get("User-Agent"),
            status="failed",
            error_message="User account is disabled",
            details={"reason": "user_inactive", "email": user.email}
        )
        db.add(audit_log)
        db.commit()
        raise HTTPException(status_code=403, detail="User account is disabled")
    
    # Get organization
    organization = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    if not organization.is_active:
        # Log failed login - inactive organization
        audit_log = AuditLog(
            action=AuditAction.LOGIN_FAILED,
            user_id=user.id,
            user_email=user.email,
            organization_id=organization.id,
            ip_address=client_ip,
            user_agent=request.headers.get("User-Agent"),
            status="failed",
            error_message="Organization is disabled",
            details={"reason": "organization_inactive", "organization": organization.name}
        )
        db.add(audit_log)
        db.commit()
        raise HTTPException(status_code=403, detail="Organization is disabled")
    
    # Check license validity
    if not organization.is_license_valid():
        # Log failed login - expired license
        audit_log = AuditLog(
            action=AuditAction.LOGIN_FAILED,
            user_id=user.id,
            user_email=user.email,
            organization_id=organization.id,
            ip_address=client_ip,
            user_agent=request.headers.get("User-Agent"),
            status="failed",
            error_message="Organization license has expired",
            details={"reason": "license_expired", "organization": organization.name}
        )
        db.add(audit_log)
        db.commit()
        raise HTTPException(status_code=403, detail="Organization license has expired")
    
    # Check IP whitelist
    if not check_ip_whitelist(client_ip, organization.allowed_ips):
        # Log failed login - IP not whitelisted
        audit_log = AuditLog(
            action=AuditAction.LOGIN_FAILED,
            user_id=user.id,
            user_email=user.email,
            organization_id=organization.id,
            ip_address=client_ip,
            user_agent=request.headers.get("User-Agent"),
            status="failed",
            error_message=f"IP address {client_ip} is not whitelisted",
            details={"reason": "ip_not_whitelisted", "ip": client_ip, "allowed_ips": organization.allowed_ips}
        )
        db.add(audit_log)
        db.commit()
        raise HTTPException(
            status_code=403,
            detail=f"IP address {client_ip} is not whitelisted for this organization"
        )
    
    # Log successful login
    audit_log = AuditLog(
        action=AuditAction.LOGIN,
        user_id=user.id,
        user_email=user.email,
        organization_id=organization.id,
        ip_address=client_ip,
        user_agent=request.headers.get("User-Agent"),
        status="success",
        details={"organization": organization.name, "role": user.role.value}
    )
    db.add(audit_log)
    
    # Update last login
    user.last_login = datetime.utcnow()
    user.last_ip = client_ip
    db.commit()
    
    # Get permissions
    permissions = get_user_permissions(user.role)
    
    # Create tokens
    token_data = {
        "user_id": str(user.id),
        "email": user.email,
        "role": user.role.value,
        "organization_id": str(organization.id),
        "permissions": permissions
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({"user_id": str(user.id)})
    
    # Store refresh token in Redis
    redis.setex(
        f"refresh_token:{user.id}",
        timedelta(days=7),
        refresh_token
    )
    
    # Cache license info
    redis.setex(
        f"license:{organization.id}",
        timedelta(minutes=30),
        f"{organization.is_license_valid()}"
    )
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "organization_id": str(organization.id),
            "organization_name": organization.name,
            "permissions": permissions
        },
        license={
            "type": organization.license_type.value,
            "expires_at": organization.license_expires_at.isoformat(),
            "features": organization.features_enabled,
            "is_valid": organization.is_license_valid()
        }
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_request: RefreshTokenRequest,
    db: Session = Depends(get_db),
    redis=Depends(get_redis)
):
    """Refresh access token using refresh token"""
    
    # Verify refresh token
    payload = verify_token(token_request.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("user_id")
    
    # Check if refresh token exists in Redis
    stored_token = redis.get(f"refresh_token:{user_id}")
    if not stored_token or stored_token != token_request.refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token has been revoked")
    
    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    # Get organization
    organization = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not organization or not organization.is_active or not organization.is_license_valid():
        raise HTTPException(status_code=403, detail="Organization license invalid")
    
    # Get permissions
    permissions = get_user_permissions(user.role)
    
    # Create new access token
    token_data = {
        "user_id": str(user.id),
        "email": user.email,
        "role": user.role.value,
        "organization_id": str(organization.id),
        "permissions": permissions
    }
    
    access_token = create_access_token(token_data)
    
    return Token(
        access_token=access_token,
        refresh_token=token_request.refresh_token,
        user={
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "organization_id": str(organization.id),
            "organization_name": organization.name,
            "permissions": permissions
        },
        license={
            "type": organization.license_type.value,
            "expires_at": organization.license_expires_at.isoformat(),
            "features": organization.features_enabled,
            "is_valid": organization.is_license_valid()
        }
    )


@router.post("/validate", response_model=ValidateTokenResponse)
async def validate_token_endpoint(
    validate_request: ValidateTokenRequest,
    db: Session = Depends(get_db)
):
    """Validate user and organization license status"""
    
    # Get user
    user = db.query(User).filter(User.id == validate_request.user_id).first()
    if not user or not user.is_active:
        return ValidateTokenResponse(
            valid=False,
            license_status="user_inactive",
            expires_at=None,
            permissions=[]
        )
    
    # Get organization
    organization = db.query(Organization).filter(Organization.id == validate_request.organization_id).first()
    if not organization:
        return ValidateTokenResponse(
            valid=False,
            license_status="organization_not_found",
            expires_at=None,
            permissions=[]
        )
    
    # Check license
    is_valid = organization.is_license_valid()
    permissions = get_user_permissions(user.role) if is_valid else []
    
    return ValidateTokenResponse(
        valid=is_valid,
        license_status="active" if is_valid else "expired",
        expires_at=organization.license_expires_at,
        permissions=permissions
    )


@router.get("/me")
async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get current user info from token"""
    
    # Get token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    # Get permissions
    permissions = get_user_permissions(user.role)
    
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.value,
        "organization_id": str(user.organization_id),
        "is_active": user.is_active,
        "permissions": permissions
    }


@router.post("/logout")
async def logout(
    user_id: str,
    redis=Depends(get_redis)
):
    """Logout - revoke refresh token"""
    redis.delete(f"refresh_token:{user_id}")
    return {"message": "Logged out successfully"}
