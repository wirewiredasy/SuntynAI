import os
import logging
from flask import Flask, render_template, request, jsonify, send_file
from werkzeug.middleware.proxy_fix import ProxyFix

# Import blueprints
from routes.image_routes import image_bp
from routes.pdf_routes import pdf_bp

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1) # needed for url_for to generate with https

# Upload configuration
app.config["UPLOAD_FOLDER"] = 'uploads'
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max file size

# Add context processor for templates that expect current_user
@app.context_processor
def inject_user():
    # Create a mock user object for templates that expect current_user
    class MockUser:
        def __init__(self):
            self.is_authenticated = False
            self.username = None
    
    return dict(current_user=MockUser())

# Register blueprints
app.register_blueprint(image_bp)
app.register_blueprint(pdf_bp)

# Main route - complete toolkit homepage with 45 tools
@app.route('/')
def index():
    # Complete toolkit data structure with 45 tools (25 PDF + 20 Image)
    tools_data = {
        # PDF Tools (25) - All Active
        'pdf-merger': {'name': 'PDF Merger', 'icon': 'ti ti-files', 'desc': 'Merge multiple PDFs into one', 'status': 'active', 'category': 'pdf'},
        'pdf-splitter': {'name': 'PDF Splitter', 'icon': 'ti ti-scissors', 'desc': 'Split PDF into separate files', 'status': 'active', 'category': 'pdf'},
        'pdf-compressor': {'name': 'PDF Compressor', 'icon': 'ti ti-package', 'desc': 'Reduce PDF file size', 'status': 'active', 'category': 'pdf'},
        'pdf-to-word': {'name': 'PDF to Word', 'icon': 'ti ti-file-word', 'desc': 'Convert PDF to Word document', 'status': 'active', 'category': 'pdf'},
        'pdf-to-excel': {'name': 'PDF to Excel', 'icon': 'ti ti-file-spreadsheet', 'desc': 'Extract tables to Excel', 'status': 'active', 'category': 'pdf'},
        'pdf-to-image': {'name': 'PDF to Image', 'icon': 'ti ti-camera', 'desc': 'Convert PDF pages to images', 'status': 'active', 'category': 'pdf'},
        'word-to-pdf': {'name': 'Word to PDF', 'icon': 'ti ti-file-text', 'desc': 'Convert Word to PDF', 'status': 'active', 'category': 'pdf'},
        'excel-to-pdf': {'name': 'Excel to PDF', 'icon': 'ti ti-table', 'desc': 'Convert Excel to PDF', 'status': 'active', 'category': 'pdf'},
        'image-to-pdf': {'name': 'Image to PDF', 'icon': 'ti ti-photo', 'desc': 'Convert images to PDF', 'status': 'active', 'category': 'pdf'},
        'text-to-pdf': {'name': 'Text to PDF', 'icon': 'ti ti-writing', 'desc': 'Convert text to PDF', 'status': 'active', 'category': 'pdf'},
        'pdf-protect': {'name': 'Protect PDF', 'icon': 'ti ti-shield', 'desc': 'Add password protection', 'status': 'active', 'category': 'pdf'},
        'pdf-unlock': {'name': 'Unlock PDF', 'icon': 'ti ti-lock-open', 'desc': 'Remove PDF password', 'status': 'active', 'category': 'pdf'},
        'pdf-watermark': {'name': 'PDF Watermark', 'icon': 'ti ti-droplet', 'desc': 'Add watermark to PDF', 'status': 'active', 'category': 'pdf'},
        'pdf-rotate': {'name': 'Rotate PDF', 'icon': 'ti ti-rotate', 'desc': 'Rotate PDF pages', 'status': 'active', 'category': 'pdf'},
        'pdf-text-extractor': {'name': 'Text Extractor', 'icon': 'ti ti-file-text', 'desc': 'Extract text from PDF', 'status': 'active', 'category': 'pdf'},
        'pdf-ocr': {'name': 'PDF OCR', 'icon': 'ti ti-scan', 'desc': 'Scan text from images', 'status': 'active', 'category': 'pdf'},
        'pdf-signature': {'name': 'Digital Sign', 'icon': 'ti ti-signature', 'desc': 'Add digital signature', 'status': 'active', 'category': 'pdf'},
        'pdf-forms': {'name': 'Fill Forms', 'icon': 'ti ti-forms', 'desc': 'Fill PDF forms', 'status': 'active', 'category': 'pdf'},
        'pdf-bookmarks': {'name': 'Bookmarks', 'icon': 'ti ti-bookmark', 'desc': 'Extract PDF bookmarks', 'status': 'active', 'category': 'pdf'},
        'pdf-metadata': {'name': 'PDF Metadata', 'icon': 'ti ti-tags', 'desc': 'View/edit PDF properties', 'status': 'active', 'category': 'pdf'},
        'pdf-compare': {'name': 'Compare PDFs', 'icon': 'ti ti-arrows-diff', 'desc': 'Compare two PDFs', 'status': 'active', 'category': 'pdf'},
        'pdf-optimizer': {'name': 'PDF Optimizer', 'icon': 'ti ti-speed', 'desc': 'Optimize PDF for web', 'status': 'active', 'category': 'pdf'},
        'pdf-annotations': {'name': 'PDF Annotations', 'icon': 'ti ti-highlight', 'desc': 'Extract/add annotations', 'status': 'active', 'category': 'pdf'},
        'pdf-redaction': {'name': 'PDF Redaction', 'icon': 'ti ti-eraser', 'desc': 'Redact sensitive info', 'status': 'active', 'category': 'pdf'},
        'pdf-page-counter': {'name': 'Page Counter', 'icon': 'ti ti-hash', 'desc': 'Count PDF pages & size', 'status': 'active', 'category': 'pdf'},
        
        # Image Tools (20) - All Active
        'image-resizer': {'name': 'Image Resizer', 'icon': 'ti ti-resize', 'desc': 'Resize images to any dimension', 'status': 'active', 'category': 'image'},
        'image-compressor': {'name': 'Image Compressor', 'icon': 'ti ti-compress', 'desc': 'Reduce image file size', 'status': 'active', 'category': 'image'},
        'convert-to-webp': {'name': 'Convert to WebP', 'icon': 'ti ti-file-type-webp', 'desc': 'Convert images to WebP', 'status': 'active', 'category': 'image'},
        'convert-to-jpg': {'name': 'Convert to JPG', 'icon': 'ti ti-file-type-jpg', 'desc': 'Convert images to JPG', 'status': 'active', 'category': 'image'},
        'convert-to-png': {'name': 'Convert to PNG', 'icon': 'ti ti-file-type-png', 'desc': 'Convert images to PNG', 'status': 'active', 'category': 'image'},
        'background-remover': {'name': 'Background Remover', 'icon': 'ti ti-eraser', 'desc': 'Remove image background', 'status': 'active', 'category': 'image'},
        'image-cropper': {'name': 'Image Cropper', 'icon': 'ti ti-crop', 'desc': 'Crop images to size', 'status': 'active', 'category': 'image'},
        'image-rotator': {'name': 'Image Rotator', 'icon': 'ti ti-rotate', 'desc': 'Rotate images by angle', 'status': 'active', 'category': 'image'},
        'add-watermark': {'name': 'Add Watermark', 'icon': 'ti ti-droplet', 'desc': 'Add text watermarks', 'status': 'active', 'category': 'image'},
        'grayscale-converter': {'name': 'Grayscale', 'icon': 'ti ti-contrast', 'desc': 'Convert to grayscale', 'status': 'active', 'category': 'image'},
        'image-blur': {'name': 'Image Blur', 'icon': 'ti ti-blur', 'desc': 'Apply blur effects', 'status': 'active', 'category': 'image'},
        'image-enhancer': {'name': 'Image Enhancer', 'icon': 'ti ti-adjustments', 'desc': 'Enhance brightness/contrast', 'status': 'active', 'category': 'image'},
        'flip-image': {'name': 'Flip Image', 'icon': 'ti ti-flip-horizontal', 'desc': 'Flip horizontally/vertically', 'status': 'active', 'category': 'image'},
        'invert-colors': {'name': 'Invert Colors', 'icon': 'ti ti-color-filter', 'desc': 'Invert image colors', 'status': 'active', 'category': 'image'},
        'add-border': {'name': 'Add Border', 'icon': 'ti ti-border-all', 'desc': 'Add borders to images', 'status': 'active', 'category': 'image'},
        'image-metadata': {'name': 'Image Metadata', 'icon': 'ti ti-info-circle', 'desc': 'View image properties', 'status': 'active', 'category': 'image'},
        'images-to-pdf': {'name': 'Images to PDF', 'icon': 'ti ti-file-export', 'desc': 'Convert images to PDF', 'status': 'active', 'category': 'image'},
        'face-pixelator': {'name': 'Face Pixelator', 'icon': 'ti ti-user-x', 'desc': 'Pixelate faces in images', 'status': 'active', 'category': 'image'},
        'meme-generator': {'name': 'Meme Generator', 'icon': 'ti ti-mood-happy', 'desc': 'Create memes with text', 'status': 'active', 'category': 'image'},
        'color-palette': {'name': 'Color Palette', 'icon': 'ti ti-palette', 'desc': 'Extract color palette', 'status': 'active', 'category': 'image'}
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
    try:
        return render_template('errors/404.html'), 404
    except:
        return '<h1>404 Not Found</h1><p>The page you requested could not be found.</p>', 404

@app.errorhandler(500)
def internal_error(error):
    try:
        return render_template('errors/500.html'), 500
    except:
        return '<h1>500 Internal Server Error</h1><p>Something went wrong on our end.</p>', 500

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

# PDF routes already registered above

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)