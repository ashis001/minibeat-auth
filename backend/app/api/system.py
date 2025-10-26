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
            "message": "API Operational"
        }
    except Exception as e:
        return {
            "status": "error",
            "response_time": int((time.time() - start_time) * 1000),
            "message": f"API health check failed: {str(e)}"
        }


def check_api_endpoints(db: Session):
    """Check individual API endpoints for detailed health status"""
    endpoints = []
    
    # Authentication API
    try:
        start = time.time()
        db.query(User).first()
        response_time = int((time.time() - start) * 1000)
        endpoints.append({
            "name": "Authentication API",
            "endpoint": "/auth/login",
            "status": "healthy" if response_time < 100 else "slow",
            "response_time": response_time,
            "message": "Operational" if response_time < 100 else f"Slow ({response_time}ms)"
        })
    except Exception as e:
        endpoints.append({
            "name": "Authentication API",
            "endpoint": "/auth/login",
            "status": "failed",
            "response_time": 0,
            "message": f"Failed: {str(e)}"
        })
    
    # Admin API
    try:
        start = time.time()
        db.query(Organization).first()
        response_time = int((time.time() - start) * 1000)
        endpoints.append({
            "name": "Admin API",
            "endpoint": "/admin/users",
            "status": "healthy" if response_time < 100 else "slow",
            "response_time": response_time,
            "message": "Operational" if response_time < 100 else f"Slow ({response_time}ms)"
        })
    except Exception as e:
        endpoints.append({
            "name": "Admin API",
            "endpoint": "/admin/users",
            "status": "failed",
            "response_time": 0,
            "message": f"Failed: {str(e)}"
        })
    
    # License API
    try:
        start = time.time()
        db.query(Organization).filter(Organization.license_expires_at != None).first()
        response_time = int((time.time() - start) * 1000)
        endpoints.append({
            "name": "License API",
            "endpoint": "/license/validate",
            "status": "healthy" if response_time < 100 else "slow",
            "response_time": response_time,
            "message": "Operational" if response_time < 100 else f"Slow ({response_time}ms)"
        })
    except Exception as e:
        endpoints.append({
            "name": "License API",
            "endpoint": "/license/validate",
            "status": "failed",
            "response_time": 0,
            "message": f"Failed: {str(e)}"
        })
    
    # Database API
    try:
        start = time.time()
        db.execute("SELECT 1")
        response_time = int((time.time() - start) * 1000)
        endpoints.append({
            "name": "Database Connection",
            "endpoint": "/database",
            "status": "healthy" if response_time < 50 else "slow",
            "response_time": response_time,
            "message": "Operational" if response_time < 50 else f"Slow ({response_time}ms)"
        })
    except Exception as e:
        endpoints.append({
            "name": "Database Connection",
            "endpoint": "/database",
            "status": "failed",
            "response_time": 0,
            "message": f"Failed: {str(e)}"
        })
    
    return endpoints


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


@router.get("/system/api-health")
async def get_api_health_details(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get detailed API health status for all endpoints (Admin only)"""
    endpoints = check_api_endpoints(db)
    
    # Calculate overall status
    failed_count = sum(1 for e in endpoints if e["status"] == "failed")
    slow_count = sum(1 for e in endpoints if e["status"] == "slow")
    
    if failed_count > 0:
        overall_status = "failed"
        overall_message = f"{failed_count} API(s) failed"
    elif slow_count > 0:
        overall_status = "slow"
        overall_message = f"{slow_count} API(s) running slow"
    else:
        overall_status = "healthy"
        overall_message = "All APIs operational"
    
    return {
        "overall_status": overall_status,
        "overall_message": overall_message,
        "total_endpoints": len(endpoints),
        "healthy_count": sum(1 for e in endpoints if e["status"] == "healthy"),
        "slow_count": slow_count,
        "failed_count": failed_count,
        "endpoints": endpoints
    }
