# Import the app for gunicorn
try:
    from app_simple import app
    print("✅ Successfully imported app_simple")
except Exception as e:
    print(f"Error importing app_simple: {e}")
    # Fallback to app.py which has proper database setup
    try:
        from app import app
        print("✅ Successfully imported app as fallback")
    except Exception as e2:
        print(f"Error importing app: {e2}")
        # Final fallback to basic Flask app
        from flask import Flask
        app = Flask(__name__)
        
        @app.route('/')
        def hello():
            return '<h1>PDF Toolkit</h1><p>Application is starting up...</p>'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)