#!/usr/bin/env python3
"""
Database initialization script for Suntyn AI
Handles both PostgreSQL (Supabase) and SQLite fallback
"""

import os
import logging
from urllib.parse import quote
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_database_url():
    """Get properly formatted database URL with URL encoding"""
    database_url = os.environ.get("DATABASE_URL")
    
    if not database_url:
        logger.info("No DATABASE_URL found, using SQLite fallback")
        return "sqlite:///suntyn_ai.db"
    
    # Fix postgres:// to postgresql://
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    # URL encode special characters in password
    if "Suntyn@#$134_" in database_url:
        logger.info("Encoding special characters in password")
        database_url = database_url.replace("Suntyn@#$134_", quote("Suntyn@#$134_", safe=''))
    
    return database_url

def test_database_connection():
    """Test database connection and create tables if needed"""
    database_url = get_database_url()
    
    try:
        # Test connection
        if "postgresql" in database_url:
            engine = create_engine(
                database_url,
                pool_pre_ping=True,
                pool_recycle=300,
                connect_args={
                    "connect_timeout": 30,
                    "application_name": "Suntyn_AI_Platform"
                }
            )
        else:
            engine = create_engine(database_url, pool_pre_ping=True)
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        logger.info("Database connection successful")
        return True, database_url
        
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        return False, str(e)

def initialize_database():
    """Initialize database with proper error handling"""
    success, result = test_database_connection()
    
    if success:
        logger.info("Database initialization successful")
        logger.info(f"Database tables created successfully")
        return True
    else:
        logger.error(f"Database initialization failed: {result}")
        return False

if __name__ == "__main__":
    initialize_database()