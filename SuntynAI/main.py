from flask import Flask, render_template, request, jsonify, send_file, redirect, url_for
import os
from routes.pdf_routes import pdf_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Register blueprints
app.register_blueprint(pdf_bp)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/tools/pdf')
def pdf_tools():
    return render_template('pdf_toolkit_section.html')

@app.route('/test-pdf')
def test_pdf():
    return render_template('test_pdf.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)