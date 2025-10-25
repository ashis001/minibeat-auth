from sqlalchemy import Column, String, DateTime, Text, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum
from app.db.database import Base


class AuditAction(enum.Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    LOGIN_FAILED = "login_failed"
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    ORG_CREATED = "org_created"
    ORG_UPDATED = "org_updated"
    ORG_DELETED = "org_deleted"
    LICENSE_EXTENDED = "license_extended"
    LICENSE_EXPIRED = "license_expired"
    PASSWORD_CHANGED = "password_changed"
    PERMISSION_CHANGED = "permission_changed"
    API_KEY_CREATED = "api_key_created"
    API_KEY_REVOKED = "api_key_revoked"


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    action = Column(Enum(AuditAction), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    user_email = Column(String, nullable=True)
    organization_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    target_id = Column(UUID(as_uuid=True), nullable=True)  # ID of affected resource
    target_type = Column(String, nullable=True)  # user, organization, license, etc.
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    details = Column(JSON, nullable=True)  # Additional context
    status = Column(String, nullable=True)  # success, failed, etc.
    error_message = Column(Text, nullable=True)
