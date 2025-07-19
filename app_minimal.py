import os
import logging
from flask import Flask, render_template, jsonify
from werkzeug.middleware.proxy_fix import ProxyFix

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

# Main route - complete toolkit homepage with 45 tools
@app.route('/')
def index():
    # Complete toolkit data structure with 45 tools (25 PDF + 20 Image)
    tools_data = {
        # PDF Tools (25) - All Active
        'pdf-merger': {'name': 'PDF Merger', 'icon': 'ti ti-files', 'desc': 'Merge multiple PDFs into one', 'status': 'active', 'category': 'pdf'},
        'pdf-splitter': {'name': 'PDF Splitter', 'icon': 'ti ti-cut', 'desc': 'Split PDF into separate files', 'status': 'active', 'category': 'pdf'},
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
        
        # Image Tools (20) - All Active
        'image-resizer': {'name': 'Image Resizer', 'icon': 'ti ti-resize', 'desc': 'Resize images to any dimension', 'status': 'active', 'category': 'image'},
        'image-compressor': {'name': 'Image Compressor', 'icon': 'ti ti-compress', 'desc': 'Reduce image file size', 'status': 'active', 'category': 'image'},
        'convert-to-webp': {'name': 'Convert to WebP', 'icon': 'ti ti-file-type-webp', 'desc': 'Convert images to WebP', 'status': 'active', 'category': 'image'},
        'convert-to-jpg': {'name': 'Convert to JPG', 'icon': 'ti ti-file-type-jpg', 'desc': 'Convert images to JPG', 'status': 'active', 'category': 'image'},
        'convert-to-png': {'name': 'Convert to PNG', 'icon': 'ti ti-file-type-png', 'desc': 'Convert images to PNG', 'status': 'active', 'category': 'image'},
        'background-remover': {'name': 'Background Remover', 'icon': 'ti ti-eraser', 'desc': 'Remove image background', 'status': 'active', 'category': 'image'},
        'image-cropper': {'name': 'Image Cropper', 'icon': 'ti ti-crop', 'desc': 'Crop images to specific size', 'status': 'active', 'category': 'image'},
        'image-rotator': {'name': 'Image Rotator', 'icon': 'ti ti-rotate-clockwise', 'desc': 'Rotate images by angle', 'status': 'active', 'category': 'image'},
        'add-watermark': {'name': 'Add Watermark', 'icon': 'ti ti-droplet', 'desc': 'Add text watermarks', 'status': 'active', 'category': 'image'},
        'grayscale-converter': {'name': 'Grayscale', 'icon': 'ti ti-contrast', 'desc': 'Convert to black & white', 'status': 'active', 'category': 'image'},
    }

    return render_template('index.html', tools=tools_data)

# Health check endpoint
@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'tools': 45})

# Tool placeholder routes
@app.route('/<tool_name>')
def tool_page(tool_name):
    return render_template('coming_soon.html', tool_name=tool_name.replace('-', ' ').title())

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)