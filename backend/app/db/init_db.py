from sqlalchemy.orm import Session
from app.db.database import engine, Base, SessionLocal
from app.models.user import User, UserRole
from app.models.organization import Organization, LicenseType
from app.core.security import get_password_hash
from app.config import settings
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db():
    """Initialize database with tables and default data"""
    
    # Create all tables
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Tables created successfully")
    
    # Create default organization and admin user
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if existing_admin:
            logger.info("⚠️ Admin user already exists, skipping initialization")
            return
        
        # Create default organization
        logger.info("Creating default organization...")
        default_org = Organization(
            name="Default Organization",
            license_type=LicenseType.TRIAL,
            license_expires_at=datetime.utcnow() + timedelta(days=30),
            max_users=10,
            features_enabled=["validator", "migrator", "reconciliator"],
            allowed_ips=[]  # Empty means no IP restriction
        )
        db.add(default_org)
        db.commit()
        db.refresh(default_org)
        logger.info(f"✅ Created organization: {default_org.name}")
        
        # Create admin user
        logger.info("Creating admin user...")
        admin_user = User(
            email=settings.ADMIN_EMAIL,
            password_hash=get_password_hash(settings.ADMIN_PASSWORD),
            full_name="System Administrator",
            role=UserRole.ADMIN,
            organization_id=default_org.id,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        logger.info(f"✅ Created admin user: {admin_user.email}")
        
        logger.info("\n" + "="*50)
        logger.info("🎉 Database initialization complete!")
        logger.info("="*50)
        logger.info(f"Admin Email: {settings.ADMIN_EMAIL}")
        logger.info(f"Admin Password: {settings.ADMIN_PASSWORD}")
        logger.info(f"Organization: {default_org.name}")
        logger.info(f"License Expires: {default_org.license_expires_at}")
        logger.info("="*50 + "\n")
        
    except Exception as e:
        logger.error(f"❌ Error during initialization: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
