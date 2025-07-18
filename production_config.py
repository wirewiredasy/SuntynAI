"""
Production Configuration for Render Deployment
Professional setup with database handling and error management
"""

import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging for production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Production configuration
    app.config.update(
        SECRET_KEY=os.environ.get("SESSION_SECRET", "your-secret-key-here"),
        WTF_CSRF_ENABLED=True,
        WTF_CSRF_TIME_LIMIT=None,
        MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB max file size
        UPLOAD_FOLDER="uploads",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SQLALCHEMY_ENGINE_OPTIONS={
            "pool_size": 10,
            "max_overflow": 20,
            "pool_pre_ping": True,
            "pool_recycle": 3600,
            "echo": False,
            "connect_args": {
                "sslmode": "require",
                "connect_timeout": 30,
                "application_name": "Suntyn_AI_Platform"
            }
        }
    )
    
    # Configure database URL with fallback logic
    database_url = get_database_url()
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    
    # Add proxy fix for production deployment
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
    
    # Initialize extensions
    db.init_app(app)
    
    # Import and register blueprints
    from tools import tools_bp
    from socket_events import socketio
    
    app.register_blueprint(tools_bp)
    socketio.init_app(app, cors_allowed_origins="*")
    
    # Create tables
    with app.app_context():
        import models
        try:
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Database table creation failed: {str(e)}")
    
    return app

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
        
        # Priority 3: Fallback to local development
        else:
            logger.warning("No database configuration found, using local fallback")
            return "sqlite:///suntyn_ai.db"
    
    except Exception as e:
        logger.error(f"Database URL configuration error: {str(e)}")
        raise

def test_database_connection():
    """Test database connection"""
    try:
        from sqlalchemy import create_engine, text
        database_url = get_database_url()
        engine = create_engine(database_url)
        
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            result.fetchone()
            logger.info("Database connection test passed")
            return True
    except Exception as e:
        logger.error(f"Database connection test failed: {str(e)}")
        return False

if __name__ == "__main__":
    # Test database connection
    if test_database_connection():
        logger.info("Database connection successful")
    else:
        logger.error("Database connection failed")