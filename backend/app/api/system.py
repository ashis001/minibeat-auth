from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.core.security import get_current_admin

router = APIRouter()


@router.get("/system/stats")
async def get_system_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get system statistics for monitoring dashboard (Admin only)"""
    
    # Organization stats
    total_orgs = db.query(Organization).count()
    active_orgs = db.query(Organization).filter(Organization.is_active == True).count()
    paused_orgs = total_orgs - active_orgs
    
    # User stats (excluding system admins)
    total_users = db.query(User).filter(User.role != UserRole.ADMIN).count()
    active_users = db.query(User).filter(
        User.role != UserRole.ADMIN,
        User.is_active == True
    ).count()
    
    # License stats
    now = datetime.utcnow()
    thirty_days = now + timedelta(days=30)
    
    expired_licenses = db.query(Organization).filter(
        Organization.license_expires_at < now
    ).count()
    
    expiring_soon = db.query(Organization).filter(
        Organization.license_expires_at >= now,
        Organization.license_expires_at <= thirty_days
    ).count()
    
    # Security stats (placeholder - would need audit log table)
    failed_logins_today = 0
    ip_violations_today = 0
    
    # API health
    api_health = {
        "status": "healthy",
        "response_time": 15
    }
    
    return {
        "total_organizations": total_orgs,
        "active_organizations": active_orgs,
        "paused_organizations": paused_orgs,
        "total_users": total_users,
        "active_users": active_users,
        "expired_licenses": expired_licenses,
        "expiring_soon": expiring_soon,
        "failed_logins_today": failed_logins_today,
        "ip_violations_today": ip_violations_today,
        "api_health": api_health
    }
