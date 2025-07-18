#!/usr/bin/env python3
"""
Database Connection Checker
Check which database is currently configured and connected
"""

import os
from database_config import get_database_url, db_config

def check_database_status():
    """Check current database configuration and connection status"""
    print("=== Database Configuration Status ===\n")

    # Check environment variables
    print("Environment Variables:")
    print(f"DATABASE_URL: {'✅ Set' if os.getenv('DATABASE_URL') else '❌ Not set'}")
    print(f"DB_SOURCE: {os.getenv('DB_SOURCE', 'Not set')}")
    print(f"DATABASE_SUPABASE_URL: {'✅ Set' if os.getenv('DATABASE_SUPABASE_URL') else '❌ Not set'}")
    print(f"DATABASE_NEON_URL: {'✅ Set' if os.getenv('DATABASE_NEON_URL') else '❌ Not set'}")

    print(f"\n=== Current Database Configuration ===")

    try:
        # Get current database URL
        database_url = get_database_url()

        # Determine database type
        if "postgresql" in database_url and "supabase" in database_url:
            db_type = "🟢 Supabase PostgreSQL"
        elif "postgresql" in database_url and "neon" in database_url:
            db_type = "🟣 Neon PostgreSQL"
        elif "postgresql" in database_url:
            db_type = "🔵 Render PostgreSQL"
        elif "sqlite" in database_url:
            db_type = "🟡 Local SQLite"
        else:
            db_type = "❓ Unknown"

        print(f"Database Type: {db_type}")
        print(f"Database URL (masked): {database_url[:50]}...")

        # Test connection
        print(f"\n=== Connection Test ===")
        health = db_config.health_check()

        if health['status'] == 'healthy':
            print(f"✅ Connection: SUCCESSFUL")
            print(f"📊 Tables: {health['table_count']}")
        else:
            print(f"❌ Connection: FAILED")
            print(f"🚨 Error: {health.get('error', 'Unknown error')}")

        # Get connection info
        conn_info = db_config.get_connection_info()
        if 'error' not in conn_info:
            print(f"\n=== Connection Details ===")
            print(f"Host: {conn_info.get('host', 'N/A')}")
            print(f"Port: {conn_info.get('port', 'N/A')}")
            print(f"Database: {conn_info.get('database', 'N/A')}")
            print(f"Username: {conn_info.get('username', 'N/A')}")
            print(f"SSL: {conn_info.get('ssl', 'N/A')}")

    except Exception as e:
        print(f"❌ Configuration Error: {str(e)}")

def main():
    check_database_status()

if __name__ == "__main__":
    main()