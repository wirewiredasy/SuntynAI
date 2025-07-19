# Import the app for Gunicorn
from app_simple import app

# For Gunicorn compatibility
application = app

if __name__ == '__main__':
    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        print(f"Error starting app: {e}")
        # Fallback to basic Flask app
        from flask import Flask
        app = Flask(__name__)

        @app.route('/')
        def hello():
            return '<h1>PDF Toolkit</h1><p>Application is starting up...</p>'

        app.run(debug=True, host='0.0.0.0', port=5000)