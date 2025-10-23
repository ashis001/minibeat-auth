from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID


class OrganizationBase(BaseModel):
    name: str
    license_type: str
    license_expires_at: datetime
    max_users: int = 5
    features_enabled: List[str] = []
    allowed_ips: List[str] = []


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    license_type: Optional[str] = None
    license_expires_at: Optional[datetime] = None
    max_users: Optional[int] = None
    features_enabled: Optional[List[str]] = None
    allowed_ips: Optional[List[str]] = None
    is_active: Optional[bool] = None


class OrganizationResponse(OrganizationBase):
    id: UUID
    is_active: bool
    created_at: datetime
    user_count: Optional[int] = 0
    
    class Config:
        from_attributes = True


class LicenseStatus(BaseModel):
    organization_id: UUID
    organization_name: str
    license_type: str
    is_valid: bool
    expires_at: datetime
    days_remaining: int
    features_enabled: List[str]
    max_users: int
    current_users: int
