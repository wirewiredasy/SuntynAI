"""
Render Deployment Configuration for Suntyn AI Platform
Professional production setup with database integration
"""

import os
import sys
import logging
from production_config import create_app, test_database_connection

# Configure logging for production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

def main():
    """Main entry point for Render deployment"""
    try:
        logger.info("Starting Suntyn AI Platform deployment")
        
        # Test database connection first
        if not test_database_connection():
            logger.error("Database connection failed - deployment aborted")
            sys.exit(1)
        
        # Create Flask app
        app = create_app()
        
        # Get port from environment (Render provides this)
        port = int(os.environ.get("PORT", 5000))
        
        logger.info(f"Starting application on port {port}")
        
        # Run the application
        app.run(
            host="0.0.0.0",
            port=port,
            debug=False,
            threaded=True
        )
        
    except Exception as e:
        logger.error(f"Deployment failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()