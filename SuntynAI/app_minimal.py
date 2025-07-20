
import os
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
app.secret_key = "dev-secret-key"

@app.route('/')
def index():
    tools_data = {
        'pdf-merger': {'name': 'PDF Merger', 'icon': 'ti ti-files', 'desc': 'Merge multiple PDFs into one', 'status': 'active', 'category': 'pdf'},
        'pdf-splitter': {'name': 'PDF Splitter', 'icon': 'ti ti-scissors', 'desc': 'Split PDF into separate files', 'status': 'active', 'category': 'pdf'},
        'pdf-compressor': {'name': 'PDF Compressor', 'icon': 'ti ti-package', 'desc': 'Reduce PDF file size', 'status': 'active', 'category': 'pdf'},
        'image-resizer': {'name': 'Image Resizer', 'icon': 'ti ti-resize', 'desc': 'Resize images to any dimension', 'status': 'active', 'category': 'image'},
        'image-compressor': {'name': 'Image Compressor', 'icon': 'ti ti-compress', 'desc': 'Reduce image file size', 'status': 'active', 'category': 'image'},
    }
    
    try:
        return render_template('index.html', tools=tools_data)
    except:
        return '''
        <h1>PDF & Image Toolkit</h1>
        <p>Welcome to the toolkit! Tools are being set up...</p>
        <ul>
            <li>PDF Merger - Merge multiple PDFs</li>
            <li>PDF Splitter - Split PDFs</li>
            <li>Image Resizer - Resize images</li>
            <li>Image Compressor - Compress images</li>
        </ul>
        '''

@app.route('/about')
def about():
    return '<h1>About</h1><p>PDF & Image Toolkit - All tools in one place!</p>'

@app.errorhandler(404)
def not_found(error):
    return '<h1>404 Not Found</h1><p>Page not found</p>', 404

@app.errorhandler(500)
def internal_error(error):
    return '<h1>500 Error</h1><p>Something went wrong</p>', 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
