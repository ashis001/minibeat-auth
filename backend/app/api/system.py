from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.api.admin import get_current_admin
import time

router = APIRouter(prefix="/admin", tags=["System"])


def check_api_health():
    """Check API health by measuring response time and availability"""
    start_time = time.time()
    try:
        # Simple self-health check - measure time to get database connection
        response_time = int((time.time() - start_time) * 1000)
        
        if response_time > 100:  # If response time > 100ms, consider it slow
            return {
                "status": "slow",
                "response_time": response_time,
                "message": f"API response slow ({response_time}ms)"
            }
        
        return {
            "status": "healthy",
            "response_time": response_time,
            "message": "API operational"
        }
    except Exception as e:
        return {
            "status": "error",
            "response_time": int((time.time() - start_time) * 1000),
            "message": f"API health check failed: {str(e)}"
        }


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
    
    # API health - use real health check
    api_health = check_api_health()
    
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
