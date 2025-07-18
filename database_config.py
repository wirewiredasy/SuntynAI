"""
The code has been updated to use the new Supabase URL as the first priority for database connections, replacing the old configuration.
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
        # Use new Supabase pooler URL for better connection handling
        database_url = "postgresql://postgres.vxappuvvmdnjddnpjroa:Suntyn2315db@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
        logger.info("Using Supabase pooler connection for optimal performance")
        return database_url

    except Exception as e:
        logger.error(f"Database URL configuration error: {str(e)}")
        # Fallback to SQLite only if absolutely necessary
        logger.warning("Using SQLite as emergency fallback")
        return "sqlite:///suntyn_ai.db"

class DatabaseConfig:
    """Professional database configuration with error handling and connection pooling"""

    def __init__(self):
        self.engine = None
        self.SessionLocal = None
        self._initialize_database()

    def _get_database_url(self):
        """Get new Supabase pooler database URL"""
        return "postgresql://postgres.vxappuvvmdnjddnpjroa:Suntyn2315db@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

    def _initialize_database(self):
        """Initialize Supabase database connection with optimized settings"""
        try:
            database_url = self._get_database_url()
            logger.info("Initializing Supabase database connection...")

            if "postgresql" in database_url:
                success = self._try_supabase_connection(database_url)
                if not success:
                    logger.warning("Supabase connection failed, falling back to SQLite")
                    self._initialize_sqlite_fallback()
                    return
            else:
                # SQLite fallback
                self._initialize_sqlite_fallback()

        except Exception as e:
            logger.error(f"Database initialization failed: {str(e)}")
            logger.warning("Falling back to SQLite database")
            self._initialize_sqlite_fallback()

    def _try_supabase_connection(self, database_url):
        """Try to connect to Supabase with optimized IPv4 connection"""
        try:
            logger.info("Connecting to Supabase with optimized settings")
            
            # Optimized settings for Supabase pooler
            connect_args = {
                "sslmode": "require",
                "connect_timeout": 30,
                "application_name": "Suntyn_AI_Platform"
            }

            self.engine = create_engine(
                database_url,
                pool_size=5,
                max_overflow=10,
                pool_pre_ping=True,
                pool_recycle=1800,  # 30 minutes
                echo=False,
                connect_args=connect_args
            )

            # Test connection with timeout
            with self.engine.connect() as connection:
                result = connection.execute(text("SELECT 1 as test, NOW() as timestamp"))
                test_result = result.fetchone()
                logger.info(f"✅ Supabase connection successful! Test: {test_result}")

            # Create session factory
            self.SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self.engine
            )

            return True

        except Exception as e:
            logger.error(f"Supabase connection failed: {str(e)}")
            if hasattr(self, 'engine'):
                self.engine.dispose()
            return False

    def _initialize_regular_connection(self, database_url):
        """Initialize regular PostgreSQL or SQLite connection"""
        if "postgresql" in database_url:
            connect_args = {
                "sslmode": "require",
                "connect_timeout": 30,
                "application_name": "Suntyn_AI_Platform"
            }
        else:
            connect_args = {}

        self.engine = create_engine(
            database_url,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=1800,
            echo=False,
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

    def _initialize_sqlite_fallback(self):
        """Initialize SQLite as fallback database"""
        try:
            sqlite_url = "sqlite:///suntyn_ai_fallback.db"
            logger.info("Initializing SQLite fallback database")

            self.engine = create_engine(
                sqlite_url,
                pool_pre_ping=True,
                echo=False
            )

            # Create session factory
            self.SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self.engine
            )

            # Test connection
            with self.engine.connect() as connection:
                connection.execute(text("SELECT 1"))

            logger.info("SQLite fallback database initialized successfully")

        except Exception as e:
            logger.error(f"Even SQLite fallback failed: {str(e)}")
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