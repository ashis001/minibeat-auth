"""update user roles

Revision ID: 003
Revises: 002
Create Date: 2025-10-26 10:16:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Add new role values to the enum
    op.execute("""
        ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'developer';
        ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'tester';
        ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'ops';
    """)
    
    # Update existing 'user' and 'viewer' roles to 'developer' (default migration)
    op.execute("""
        UPDATE users SET role = 'developer' WHERE role IN ('user', 'viewer');
    """)


def downgrade():
    # Revert users back to 'user' role
    op.execute("""
        UPDATE users SET role = 'user' WHERE role IN ('developer', 'tester', 'ops');
    """)
    
    # Note: PostgreSQL doesn't support removing enum values easily
    # Would require dropping and recreating the enum type
