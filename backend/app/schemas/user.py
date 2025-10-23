from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: str = "user"
    organization_id: UUID


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: UUID
    role: str
    organization_id: UUID
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]
    permissions: List[str]
    
    class Config:
        from_attributes = True


class UserWithOrganization(UserResponse):
    organization_name: str
    license_expires_at: datetime
    features_enabled: List[str]
