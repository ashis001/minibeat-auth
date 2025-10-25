from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.user import User
from app.models.organization import Organization
from app.api.admin import get_current_admin

router = APIRouter(prefix="/admin/stats", tags=["Stats"])


@router.get("/dashboard")
async def get_dashboard_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    
    # Total users
    total_users = db.query(User).filter(User.is_active == True).count()
    
    # Total organizations
    total_organizations = db.query(Organization).filter(Organization.is_active == True).count()
    
    # Active licenses (not expired)
    active_licenses = db.query(Organization).filter(
        Organization.is_active == True,
        Organization.license_expires_at > datetime.utcnow()
    ).count()
    
    # Expiring soon (within 30 days)
    expiring_soon = db.query(Organization).filter(
        Organization.is_active == True,
        Organization.license_expires_at > datetime.utcnow(),
        Organization.license_expires_at <= datetime.utcnow() + timedelta(days=30)
    ).count()
    
    # Users created in last 7 days
    last_week = datetime.utcnow() - timedelta(days=7)
    new_users_week = db.query(User).filter(
        User.created_at >= last_week
    ).count()
    
    # User login activity (last 30 days)
    last_month = datetime.utcnow() - timedelta(days=30)
    active_users_month = db.query(User).filter(
        User.last_login >= last_month
    ).count()
    
    # License type distribution
    license_distribution = db.query(
        Organization.license_type,
        func.count(Organization.id).label('count')
    ).filter(Organization.is_active == True).group_by(Organization.license_type).all()
    
    license_types = {str(lt): count for lt, count in license_distribution}
    
    # Users by role
    role_distribution = db.query(
        User.role,
        func.count(User.id).label('count')
    ).filter(User.is_active == True).group_by(User.role).all()
    
    user_roles = {str(role): count for role, count in role_distribution}
    
    # Recent users (last 5)
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    recent_users_list = [{
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.value,
        "created_at": user.created_at.isoformat()
    } for user in recent_users]
    
    # Recent organizations (last 5)
    recent_orgs = db.query(Organization).order_by(Organization.created_at.desc()).limit(5).all()
    recent_orgs_list = [{
        "id": str(org.id),
        "name": org.name,
        "license_type": org.license_type.value,
        "created_at": org.created_at.isoformat()
    } for org in recent_orgs]
    
    return {
        "total_users": total_users,
        "total_organizations": total_organizations,
        "active_licenses": active_licenses,
        "expiring_soon": expiring_soon,
        "new_users_week": new_users_week,
        "active_users_month": active_users_month,
        "license_distribution": license_types,
        "user_roles": user_roles,
        "recent_users": recent_users_list,
        "recent_organizations": recent_orgs_list
    }
