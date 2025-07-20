
import os
import sys
import logging

# Add SuntynAI directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'SuntynAI'))

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Import the app from SuntynAI
try:
    from app_simple import app
    print("✅ Successfully imported app_simple from SuntynAI")
except Exception as e:
    print(f"❌ Error importing app_simple: {e}")
    try:
        from app import app
        print("✅ Successfully imported app as fallback from SuntynAI")
    except Exception as e2:
        print(f"❌ Error importing app: {e2}")
        try:
            from app_minimal import app
            print("✅ Successfully imported minimal app")
        except Exception as e3:
            print(f"❌ Error importing minimal app: {e3}")
            # Create basic fallback app
            from flask import Flask
            app = Flask(__name__)
            
            @app.route('/')
            def hello():
                return '<h1>PDF Toolkit</h1><p>Application starting...</p><p>Basic tools will be available soon!</p>'

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(debug=True, host='0.0.0.0', port=port)
