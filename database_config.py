"""
Professional Database Configuration for Production Deployment
Supports both Supabase and Neon PostgreSQL databases with proper error handling
"""
from urllib.parse import quote_plus

import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from contextlib import contextmanager
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_database_url():
    """Get database URL with proper error handling"""
    try:
        # Priority 1: Check for Render's automatic DATABASE_URL
        if os.getenv("DATABASE_URL"):
            logger.info("Using Render PostgreSQL database")
            return os.getenv("DATABASE_URL")

        # Priority 2: Check for custom DB_SOURCE configuration
        db_source = os.getenv("DB_SOURCE", "").lower()

        if db_source == "supabase":
            database_url = os.getenv("DATABASE_SUPABASE_URL")
            if not database_url:
                raise ValueError("DATABASE_SUPABASE_URL environment variable is required")

            # Fix URL encoding for special characters in password
            if "Suntyn@#$134_" in database_url:
                logger.info("Encoding special characters in password")
                # Extract and encode the password properly
                password = "Suntyn@#$134_"
                encoded_password = quote_plus(password)
                # Replace the password part in URL
                database_url = database_url.replace(password, encoded_password)
                logger.info("Password encoded successfully")

            logger.info("Using Supabase PostgreSQL database")
            return database_url

        elif db_source == "neon":
            database_url = os.getenv("DATABASE_NEON_URL")
            if not database_url:
                raise ValueError("DATABASE_NEON_URL environment variable is required")

            # Clean up Neon URL format
            if database_url.startswith("psql"):
                database_url = database_url.replace("psql '", "").replace("'", "")

            logger.info("Using Neon PostgreSQL database")
            return database_url

        # Priority 3: Check for Replit PostgreSQL 
        elif os.getenv("REPLIT_DB_URL"):
            logger.info("Using Replit PostgreSQL database")
            return os.getenv("REPLIT_DB_URL")

        # Priority 4: Fallback to local development
        else:
            logger.warning("No database configuration found, using local fallback")
            return "sqlite:///suntyn_ai.db"

    except Exception as e:
        logger.error(f"Database URL configuration error: {str(e)}")
        raise

class DatabaseConfig:
    """Professional database configuration with error handling and connection pooling"""

    def __init__(self):
        self.engine = None
        self.SessionLocal = None
        self._initialize_database()

    def _get_database_url(self):
        """Get database URL based on environment configuration"""
        try:
            # Priority 1: Check for Supabase database
            db_source = os.getenv("DB_SOURCE", "").lower()

            if db_source == "supabase":
                database_url = os.getenv("DATABASE_SUPABASE_URL")
                if not database_url:
                    raise ValueError("DATABASE_SUPABASE_URL environment variable is required when DB_SOURCE=supabase")

                # Fix URL encoding for special characters in password
                if "Suntyn@#$134_" in database_url:
                    logger.info("Encoding special characters in password")
                    # Extract and encode the password properly
                    password = "Suntyn@#$134_"
                    encoded_password = quote_plus(password)
                    # Replace the password part in URL
                    database_url = database_url.replace(password, encoded_password)
                    logger.info("Password encoded successfully")
                
                logger.info("Using Supabase PostgreSQL database")
                return database_url

            # Priority 2: Check for any DATABASE_URL
            elif os.getenv("DATABASE_URL"):
                logger.info("Using DATABASE_URL")
                return os.getenv("DATABASE_URL")

            # Priority 3: Check for Neon database
            elif db_source == "neon":
                database_url = os.getenv("DATABASE_NEON_URL")
                if not database_url:
                    raise ValueError("DATABASE_NEON_URL environment variable is required when DB_SOURCE=neon")

                # Clean up Neon URL if it contains psql command
                if database_url.startswith("psql"):
                    database_url = database_url.replace("psql '", "").replace("'", "")

                logger.info("Using Neon PostgreSQL database")
                return database_url

            # Priority 4: Fallback to SQLite for development
            else:
                logger.warning("No database configuration found, using SQLite fallback")
                return "sqlite:///suntyn_ai.db"

        except Exception as e:
            logger.error(f"Database URL configuration error: {str(e)}")
            # Return SQLite as emergency fallback
            logger.warning("Using SQLite as emergency fallback")
            return "sqlite:///suntyn_ai.db"

    def _initialize_database(self):
        """Initialize database connection with proper error handling"""
        try:
            database_url = self._get_database_url()

            # Create engine with production-ready settings
            if "postgresql" in database_url:
                connect_args = {
                    "sslmode": "require",  # Require SSL for PostgreSQL
                    "connect_timeout": 30,
                    "application_name": "Suntyn_AI_Platform"
                }
            else:
                connect_args = {}

            self.engine = create_engine(
                database_url,
                pool_size=5,               # Connection pool size
                max_overflow=10,           # Maximum overflow connections
                pool_pre_ping=True,        # Verify connections before use
                pool_recycle=1800,         # Recycle connections every 30 minutes
                echo=False,                # Set to True for SQL debugging
                connect_args=connect_args
            )

            # Create session factory
            self.SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self.engine
            )

            # Test connection
            self._test_connection()
            logger.info("Database connection established successfully")

        except Exception as e:
            logger.error(f"Database initialization failed: {str(e)}")
            raise

    def _test_connection(self):
        """Test database connection"""
        try:
            with self.engine.connect() as connection:
                result = connection.execute(text("SELECT 1"))
                result.fetchone()
                logger.info("Database connection test passed")
        except Exception as e:
            logger.error(f"Database connection test failed: {str(e)}")
            raise

    @contextmanager
    def get_db_session(self):
        """Get database session with automatic cleanup"""
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database session error: {str(e)}")
            raise
        finally:
            session.close()

    def create_tables(self):
        """Create all database tables"""
        try:
            from models import db
            from app import app

            with app.app_context():
                # Drop existing tables in development (comment out in production)
                # db.drop_all()

                # Create all tables
                db.create_all()
                logger.info("Database tables created successfully")

                # Verify tables were created
                with self.engine.connect() as connection:
                    result = connection.execute(text("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public'
                    """))
                    tables = [row[0] for row in result.fetchall()]
                    logger.info(f"Created tables: {tables}")

        except Exception as e:
            logger.error(f"Table creation failed: {str(e)}")
            raise

    def health_check(self):
        """Perform database health check"""
        try:
            with self.engine.connect() as connection:
                # Check connection
                connection.execute(text("SELECT 1"))

                # Check table existence
                result = connection.execute(text("""
                    SELECT COUNT(*) 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """))
                table_count = result.fetchone()[0]

                return {
                    "status": "healthy",
                    "table_count": table_count,
                    "timestamp": time.time()
                }
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": time.time()
            }

    def get_connection_info(self):
        """Get database connection information (safe for logging)"""
        try:
            database_url = self._get_database_url()
            # Parse URL safely without exposing password
            from urllib.parse import urlparse
            parsed = urlparse(database_url)

            return {
                "host": parsed.hostname,
                "port": parsed.port,
                "database": parsed.path.lstrip('/'),
                "username": parsed.username,
                "ssl": "enabled" if "sslmode=require" in database_url else "disabled"
            }
        except Exception as e:
            logger.error(f"Failed to get connection info: {str(e)}")
            return {"error": str(e)}

# Global database instance
db_config = DatabaseConfig()

# Export for use in other modules
get_db_session = db_config.get_db_session
create_tables = db_config.create_tables
health_check = db_config.health_check
engine = db_config.engine