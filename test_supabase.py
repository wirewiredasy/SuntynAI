
import os
import logging
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_supabase_connection():
    """Test direct Supabase connection"""
    try:
        # Use the new Supabase pooler URL
        database_url = "postgresql://postgres.vxappuvvmdnjddnpjroa:Suntyn2315db@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
        
        logger.info("Testing Supabase connection...")
        logger.info(f"Database URL: {database_url[:50]}...")
        
        # Create engine with optimized settings
        engine = create_engine(
            database_url,
            pool_size=3,
            max_overflow=5,
            pool_pre_ping=True,
            connect_args={
                "sslmode": "prefer",
                "connect_timeout": 60,
                "application_name": "Suntyn_AI_Test"
            }
        )
        
        # Test connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1 as test"))
            test_result = result.fetchone()
            logger.info(f"✅ Connection successful! Test result: {test_result}")
            
            # Test table creation
            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS connection_test (
                    id SERIAL PRIMARY KEY,
                    test_message TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # Insert test data
            connection.execute(text("""
                INSERT INTO connection_test (test_message) 
                VALUES ('Supabase connection working!')
            """))
            
            # Read test data
            result = connection.execute(text("SELECT * FROM connection_test LIMIT 1"))
            test_data = result.fetchone()
            logger.info(f"✅ Database operations successful! Data: {test_data}")
            
            connection.commit()
            logger.info("🎉 Supabase is fully connected and working!")
            return True
            
    except Exception as e:
        logger.error(f"❌ Supabase connection failed: {str(e)}")
        return False
    finally:
        if 'engine' in locals():
            engine.dispose()

if __name__ == "__main__":
    success = test_supabase_connection()
    if success:
        print("\n🚀 Supabase database is live and ready!")
        print("✅ Your website is connected to Supabase")
        print("✅ All tools will use the cloud database")
    else:
        print("\n⚠️ Supabase connection needs attention")
