from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.audit_log import AuditLog, AuditAction
from app.models.user import User
from app.api.admin import get_current_admin
from pydantic import BaseModel
from uuid import UUID

router = APIRouter(prefix="/admin/audit", tags=["Audit"])


class AuditLogResponse(BaseModel):
    id: str
    timestamp: datetime
    action: str
    user_email: Optional[str]
    organization_id: Optional[str]
    target_type: Optional[str]
    ip_address: Optional[str]
    status: Optional[str]
    details: Optional[dict]


async def create_audit_log(
    db: Session,
    action: AuditAction,
    user_id: Optional[UUID] = None,
    user_email: Optional[str] = None,
    organization_id: Optional[UUID] = None,
    target_id: Optional[UUID] = None,
    target_type: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    details: Optional[dict] = None,
    status: str = "success",
    error_message: Optional[str] = None
):
    """Helper function to create audit log entries"""
    log = AuditLog(
        action=action,
        user_id=user_id,
        user_email=user_email,
        organization_id=organization_id,
        target_id=target_id,
        target_type=target_type,
        ip_address=ip_address,
        user_agent=user_agent,
        details=details,
        status=status,
        error_message=error_message
    )
    db.add(log)
    db.commit()
    return log


@router.get("/logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    organization_id: Optional[UUID] = None,
    action: Optional[str] = None,
    days: int = 30,
    limit: int = 100,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get audit logs with filters"""
    
    query = db.query(AuditLog)
    
    # Filter by organization
    if organization_id:
        query = query.filter(AuditLog.organization_id == organization_id)
    
    # Filter by action
    if action:
        query = query.filter(AuditLog.action == action)
    
    # Filter by date range
    start_date = datetime.utcnow() - timedelta(days=days)
    query = query.filter(AuditLog.timestamp >= start_date)
    
    # Order and limit
    logs = query.order_by(desc(AuditLog.timestamp)).limit(limit).all()
    
    return [
        AuditLogResponse(
            id=str(log.id),
            timestamp=log.timestamp,
            action=log.action.value,
            user_email=log.user_email,
            organization_id=str(log.organization_id) if log.organization_id else None,
            target_type=log.target_type,
            ip_address=log.ip_address,
            status=log.status,
            details=log.details
        )
        for log in logs
    ]


@router.get("/stats")
async def get_audit_stats(
    days: int = 7,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get audit statistics"""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Total actions
    total_actions = db.query(AuditLog).filter(
        AuditLog.timestamp >= start_date
    ).count()
    
    # Failed logins
    failed_logins = db.query(AuditLog).filter(
        AuditLog.timestamp >= start_date,
        AuditLog.action == AuditAction.LOGIN_FAILED
    ).count()
    
    # User activities
    user_activities = db.query(AuditLog).filter(
        AuditLog.timestamp >= start_date,
        AuditLog.action.in_([
            AuditAction.USER_CREATED,
            AuditAction.USER_UPDATED,
            AuditAction.USER_DELETED
        ])
    ).count()
    
    # Org activities
    org_activities = db.query(AuditLog).filter(
        AuditLog.timestamp >= start_date,
        AuditLog.action.in_([
            AuditAction.ORG_CREATED,
            AuditAction.ORG_UPDATED,
            AuditAction.ORG_DELETED
        ])
    ).count()
    
    return {
        "total_actions": total_actions,
        "failed_logins": failed_logins,
        "user_activities": user_activities,
        "org_activities": org_activities,
        "period_days": days
    }
