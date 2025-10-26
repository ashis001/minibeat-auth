"""
Role-based access control permissions for MiniBeast
"""
from app.models.user import UserRole

# Define module access permissions for each role
ROLE_PERMISSIONS = {
    UserRole.ADMIN: {
        "modules": [],  # Admin is for auth portal only, not MiniBeast
        "description": "System administrator - Auth portal access only"
    },
    UserRole.DEVELOPER: {
        "modules": [
            "dashboard",
            "validator",
            "reconciliator",
            "config",
            "migrator"
        ],
        "description": "Full access to all MiniBeast modules"
    },
    UserRole.TESTER: {
        "modules": [
            "dashboard",
            "validator",
            "reconciliator"
        ],
        "description": "Access to Validator, Dashboard, and Reconciliator"
    },
    UserRole.OPS: {
        "modules": [
            "dashboard",
            "validator"
        ],
        "description": "Access to Dashboard and Validator only"
    }
}


def get_user_permissions(role: UserRole) -> dict:
    """
    Get permissions for a specific user role
    
    Args:
        role: UserRole enum value
        
    Returns:
        Dictionary containing modules and description
    """
    return ROLE_PERMISSIONS.get(role, {
        "modules": [],
        "description": "No access"
    })


def can_access_module(role: UserRole, module: str) -> bool:
    """
    Check if a role can access a specific module
    
    Args:
        role: UserRole enum value
        module: Module name (e.g., "validator", "config")
        
    Returns:
        Boolean indicating access permission
    """
    permissions = get_user_permissions(role)
    return module.lower() in permissions.get("modules", [])
