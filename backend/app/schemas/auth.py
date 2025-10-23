from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict
    license: dict


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenData(BaseModel):
    user_id: str
    email: str
    role: str
    organization_id: str
    permissions: List[str]
    exp: datetime


class ValidateTokenRequest(BaseModel):
    user_id: str
    organization_id: str


class ValidateTokenResponse(BaseModel):
    valid: bool
    license_status: str
    expires_at: Optional[datetime]
    permissions: List[str]
