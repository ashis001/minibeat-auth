from typing import Dict, List
from app.models.user import UserRole

# Role-based permissions
PERMISSIONS: Dict[UserRole, List[str]] = {
    UserRole.ADMIN: [
        # Deployment
        "deploy",
        "view_deployments",
        "delete_deployments",
        
        # Validations
        "view_validations",
        "add_validations",
        "edit_validations",
        "delete_validations",
        "run_validations",
        
        # Activity
        "view_activity",
        
        # User Management
        "manage_users",
        "view_users",
        "create_users",
        "delete_users",
        
        # Organization
        "manage_organization",
        "view_license",
    ],
    UserRole.USER: [
        # Validations
        "view_validations",
        "add_validations",
        "edit_validations",
        "run_validations",
        
        # Activity
        "view_activity",
        
        # Limited access
        "view_license",
    ],
    UserRole.VIEWER: [
        # Read-only
        "view_validations",
        "view_activity",
        "view_license",
    ]
}


def has_permission(role: UserRole, permission: str) -> bool:
    """Check if a role has a specific permission"""
    return permission in PERMISSIONS.get(role, [])


def get_user_permissions(role: UserRole) -> List[str]:
    """Get all permissions for a role"""
    return PERMISSIONS.get(role, [])


def check_feature_access(features_enabled: List[str], feature: str) -> bool:
    """Check if organization has access to a feature"""
    return feature in features_enabled
