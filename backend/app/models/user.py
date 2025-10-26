from sqlalchemy import Column, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum
from app.db.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"          # System admin - full access to auth portal
    DEVELOPER = "developer"  # Full access to all MiniBeast modules
    TESTER = "tester"        # Access to Validator, Dashboard, Reconciliator
    OPS = "ops"              # Access to Validator and Dashboard only


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Profile
    full_name = Column(String(255))
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)
    
    # Organization
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    # Audit
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)  # Only admin can create
    last_login = Column(DateTime, nullable=True)
    last_ip = Column(String(45), nullable=True)  # IPv6 max length
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    
    def __repr__(self):
        return f"<User {self.email}>"
    
    def is_admin(self):
        return self.role == UserRole.ADMIN
