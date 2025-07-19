# Import the app for Gunicorn
try:
    from app_simple import app
except ImportError as e:
    print(f"Could not import app_simple: {e}")
    from app_minimal import app

# For Gunicorn compatibility
application = app

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)