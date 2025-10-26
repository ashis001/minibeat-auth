from typing import Dict, List
from app.models.user import UserRole

# Role-based permissions
PERMISSIONS: Dict[UserRole, List[str]] = {
    UserRole.ADMIN: [
        # System admin - Auth portal only, no MiniBeast access
        "manage_users",
        "view_users",
        "create_users",
        "delete_users",
        "manage_organization",
        "view_license",
        "manage_licenses",
    ],
    UserRole.DEVELOPER: [
        # Full MiniBeast access
        "deploy",
        "view_deployments",
        "delete_deployments",
        "view_validations",
        "add_validations",
        "edit_validations",
        "delete_validations",
        "run_validations",
        "view_activity",
        "view_license",
        "use_migrator",
        "use_config",
        "use_reconciliator",
    ],
    UserRole.TESTER: [
        # Validator, Dashboard, Reconciliator
        "view_validations",
        "add_validations",
        "edit_validations",
        "run_validations",
        "view_activity",
        "view_license",
        "use_reconciliator",
    ],
    UserRole.OPS: [
        # Dashboard and Validator only
        "view_validations",
        "run_validations",
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
