import os
import logging
from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1) # needed for url_for to generate with https

# configure the database, relative to the app instance folder
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///pdf_toolkit.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Upload configuration
app.config["UPLOAD_FOLDER"] = 'uploads'
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max file size

# initialize the app with the extension, flask-sqlalchemy >= 3.0.x
db.init_app(app)

# Add context processor for templates that expect current_user
@app.context_processor
def inject_user():
    # Create a mock user object for templates that expect current_user
    class MockUser:
        def __init__(self):
            self.is_authenticated = False
            self.username = None
    
    return dict(current_user=MockUser())

with app.app_context():
    # Make sure to import the models here or their tables won't be created
    try:
        import models  # noqa: F401
        db.create_all()
        logging.info("✅ Database tables created successfully")
    except ImportError:
        logging.warning("No models.py file found, creating basic tables")
        db.create_all()

# Main route - clean PDF toolkit homepage
@app.route('/')
def index():
    # Simple PDF toolkit data structure
    tools_data = {
        # Core PDF Tools (Working)
        'merge': {'name': 'PDF Merger', 'icon': 'ti ti-files', 'desc': 'Merge multiple PDFs into one', 'status': 'active'},
        'split': {'name': 'PDF Splitter', 'icon': 'ti ti-cut', 'desc': 'Split PDF into separate files', 'status': 'active'},
        'compress': {'name': 'PDF Compressor', 'icon': 'ti ti-package', 'desc': 'Reduce PDF file size', 'status': 'active'},
        'pdf-to-word': {'name': 'PDF to Word', 'icon': 'ti ti-file-word', 'desc': 'Convert PDF to Word document', 'status': 'active'},
        'pdf-to-image': {'name': 'PDF to Image', 'icon': 'ti ti-camera', 'desc': 'Extract images from PDF', 'status': 'active'},
        'image-to-pdf': {'name': 'Image to PDF', 'icon': 'ti ti-photo', 'desc': 'Convert images to PDF', 'status': 'active'},
        
        # Additional PDF Tools (Coming Soon)
        'pdf-to-excel': {'name': 'PDF to Excel', 'icon': 'ti ti-file-spreadsheet', 'desc': 'Extract tables to Excel', 'status': 'coming'},
        'word-to-pdf': {'name': 'Word to PDF', 'icon': 'ti ti-file-text', 'desc': 'Convert Word to PDF', 'status': 'coming'},
        'unlock-pdf': {'name': 'Unlock PDF', 'icon': 'ti ti-lock-open', 'desc': 'Remove PDF password', 'status': 'coming'},
        'protect-pdf': {'name': 'Protect PDF', 'icon': 'ti ti-shield', 'desc': 'Add password to PDF', 'status': 'coming'},
        'rotate-pdf': {'name': 'Rotate PDF', 'icon': 'ti ti-rotate', 'desc': 'Rotate PDF pages', 'status': 'coming'},
        'watermark': {'name': 'Add Watermark', 'icon': 'ti ti-droplet', 'desc': 'Add watermark to PDF', 'status': 'coming'},
        'pdf-to-text': {'name': 'PDF to Text', 'icon': 'ti ti-file-text', 'desc': 'Extract text from PDF', 'status': 'coming'},
        'text-to-pdf': {'name': 'Text to PDF', 'icon': 'ti ti-writing', 'desc': 'Convert text to PDF', 'status': 'coming'},
        'pdf-pages': {'name': 'Extract Pages', 'icon': 'ti ti-file-export', 'desc': 'Extract specific pages', 'status': 'coming'},
        'pdf-info': {'name': 'PDF Info', 'icon': 'ti ti-info-circle', 'desc': 'View PDF properties', 'status': 'coming'},
        'pdf-repair': {'name': 'Repair PDF', 'icon': 'ti ti-tool', 'desc': 'Fix corrupted PDFs', 'status': 'coming'},
        'pdf-ocr': {'name': 'PDF OCR', 'icon': 'ti ti-scan', 'desc': 'Scan text from images', 'status': 'coming'},
        'pdf-signature': {'name': 'Sign PDF', 'icon': 'ti ti-signature', 'desc': 'Add digital signature', 'status': 'coming'},
        'pdf-form': {'name': 'Fill Forms', 'icon': 'ti ti-forms', 'desc': 'Fill PDF forms', 'status': 'coming'},
        'pdf-bookmark': {'name': 'Add Bookmarks', 'icon': 'ti ti-bookmark', 'desc': 'Add navigation bookmarks', 'status': 'coming'},
        'pdf-metadata': {'name': 'Edit Metadata', 'icon': 'ti ti-tags', 'desc': 'Edit PDF properties', 'status': 'coming'},
        'pdf-compare': {'name': 'Compare PDFs', 'icon': 'ti ti-arrows-diff', 'desc': 'Compare two PDFs', 'status': 'coming'},
        'pdf-optimize': {'name': 'Optimize PDF', 'icon': 'ti ti-speed', 'desc': 'Optimize for web', 'status': 'coming'},
        'pdf-annotate': {'name': 'Annotate PDF', 'icon': 'ti ti-highlight', 'desc': 'Add annotations', 'status': 'coming'},
        'pdf-redact': {'name': 'Redact PDF', 'icon': 'ti ti-eraser', 'desc': 'Remove sensitive info', 'status': 'coming'}
    }
    return render_template('index.html', tools=tools_data)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/faq')
def faq():
    return render_template('faq.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/terms')
def terms():
    return render_template('terms.html')

@app.route('/security')
def security():
    return render_template('security.html')

@app.route('/cookies')
def cookies():
    return render_template('cookies.html')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('errors/404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('errors/500.html'), 500

# Service worker
@app.route('/service-worker.js')
def service_worker():
    return send_file('service-worker.js', mimetype='application/javascript')

# Placeholder auth routes
@app.route('/login')
def login():
    return '<h1>Login</h1><p>Login functionality coming soon!</p><a href="/">← Back to Home</a>'

@app.route('/register') 
def register():
    return '<h1>Register</h1><p>Registration functionality coming soon!</p><a href="/">← Back to Home</a>'

@app.route('/dashboard')
def dashboard():
    return '<h1>Dashboard</h1><p>Dashboard functionality coming soon!</p><a href="/">← Back to Home</a>'

@app.route('/profile')
def profile():
    return '<h1>Profile</h1><p>Profile functionality coming soon!</p><a href="/">← Back to Home</a>'

@app.route('/settings')
def settings():
    return '<h1>Settings</h1><p>Settings functionality coming soon!</p><a href="/">← Back to Home</a>'

@app.route('/logout')
def logout():
    return '<h1>Logout</h1><p>Logout functionality coming soon!</p><a href="/">← Back to Home</a>'

# Generic tool page route
@app.route('/tool/<tool_name>')
def tool_page(tool_name):
    return f'<h1>{tool_name.replace("-", " ").title()}</h1><p>This tool is coming soon!</p><a href="/">← Back to Home</a>'

# Register PDF routes blueprint
try:
    from routes.pdf_routes import pdf_bp
    app.register_blueprint(pdf_bp)
    logging.info("✅ PDF routes registered successfully")
except ImportError as e:
    logging.warning(f"Could not import PDF routes: {e}")

# Register Image routes blueprint
try:
    from routes.image_routes import image_bp
    app.register_blueprint(image_bp)
    logging.info("✅ Image routes registered successfully")
except ImportError as e:
    logging.warning(f"Could not import Image routes: {e}")

# Register Government routes blueprint
try:
    from routes.govt_routes import govt_bp
    app.register_blueprint(govt_bp)
    logging.info("✅ Government routes registered successfully")
except ImportError as e:
    logging.warning(f"Could not import Government routes: {e}")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)