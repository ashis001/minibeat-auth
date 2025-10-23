from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum
from app.db.database import Base


class LicenseType(str, enum.Enum):
    TRIAL = "trial"
    STANDARD = "standard"
    ENTERPRISE = "enterprise"


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    
    # License Information
    license_type = Column(Enum(LicenseType), nullable=False, default=LicenseType.TRIAL)
    license_expires_at = Column(DateTime, nullable=False)
    max_users = Column(Integer, nullable=False, default=5)
    
    # Features & Security
    features_enabled = Column(JSON, nullable=False, default=list)  # ['validator', 'migrator', 'reconciliator']
    allowed_ips = Column(JSON, nullable=False, default=list)  # ['1.2.3.4', '10.0.0.0/24']
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Organization {self.name}>"
    
    def is_license_valid(self):
        """Check if license is still valid"""
        return self.is_active and self.license_expires_at > datetime.utcnow()
    
    def has_feature(self, feature: str):
        """Check if organization has access to a feature"""
        return feature in self.features_enabled
