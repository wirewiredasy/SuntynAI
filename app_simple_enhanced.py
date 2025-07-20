import os
import logging
from flask import Flask, render_template, request, send_file, jsonify, redirect, url_for, flash
from werkzeug.utils import secure_filename
import tempfile
import uuid
from PIL import Image
import io
import PyPDF2
import fitz

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-suntyn-ai")
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

# Simple tool categories with working PDF and Image tools
TOOL_CATEGORIES = {
    'pdf': {
        'name': 'PDF Tools',
        'icon': 'fas fa-file-pdf',
        'color': 'red',
        'description': 'Professional PDF processing and manipulation',
        'tools': [
            {'id': 'pdf-merger', 'name': 'PDF Merger', 'desc': 'Merge multiple PDF files into one', 'icon': 'fas fa-plus'},
            {'id': 'pdf-splitter', 'name': 'PDF Splitter', 'desc': 'Split PDF by pages or ranges', 'icon': 'fas fa-cut'},
            {'id': 'pdf-compressor', 'name': 'PDF Compressor', 'desc': 'Reduce PDF file size significantly', 'icon': 'fas fa-compress'},
            {'id': 'pdf-to-text', 'name': 'PDF to Text', 'desc': 'Extract text content from PDF', 'icon': 'fas fa-file-alt'},
            {'id': 'pdf-to-images', 'name': 'PDF to Images', 'desc': 'Convert PDF pages to images', 'icon': 'fas fa-images'},
        ]
    },
    'image': {
        'name': 'Image Tools',
        'icon': 'fas fa-image',
        'color': 'blue',
        'description': 'Advanced image processing and editing',
        'tools': [
            {'id': 'image-resize', 'name': 'Image Resizer', 'desc': 'Resize images to any dimensions', 'icon': 'fas fa-expand-arrows-alt'},
            {'id': 'image-compress', 'name': 'Image Compressor', 'desc': 'Compress images without quality loss', 'icon': 'fas fa-compress'},
            {'id': 'format-converter', 'name': 'Format Converter', 'desc': 'Convert between image formats', 'icon': 'fas fa-exchange-alt'},
            {'id': 'image-filters', 'name': 'Image Filters', 'desc': 'Apply professional filters', 'icon': 'fas fa-palette'},
            {'id': 'image-rotate', 'name': 'Image Rotator', 'desc': 'Rotate and flip images', 'icon': 'fas fa-redo'},
        ]
    },
    'ai': {
        'name': 'AI Tools',
        'icon': 'fas fa-brain',
        'color': 'purple',
        'description': 'AI-powered analysis and processing',
        'tools': [
            {'id': 'text-analyzer', 'name': 'Text Analyzer', 'desc': 'Analyze text with AI', 'icon': 'fas fa-search'},
            {'id': 'image-analyzer', 'name': 'Image Analyzer', 'desc': 'AI image analysis', 'icon': 'fas fa-eye'},
            {'id': 'content-generator', 'name': 'Content Generator', 'desc': 'Generate AI content', 'icon': 'fas fa-magic'},
        ]
    },
    'utility': {
        'name': 'Utility Tools',
        'icon': 'fas fa-tools',
        'color': 'green',
        'description': 'Helpful utility tools for daily tasks',
        'tools': [
            {'id': 'qr-generator', 'name': 'QR Code Generator', 'desc': 'Generate QR codes', 'icon': 'fas fa-qrcode'},
            {'id': 'url-shortener', 'name': 'URL Shortener', 'desc': 'Shorten long URLs', 'icon': 'fas fa-link'},
            {'id': 'password-generator', 'name': 'Password Generator', 'desc': 'Generate secure passwords', 'icon': 'fas fa-key'},
        ]
    }
}

# Simple PDF processing functions
def merge_pdfs(pdf_files):
    merger = PyPDF2.PdfMerger()
    output = io.BytesIO()
    
    for pdf_file in pdf_files:
        pdf_file.seek(0)
        merger.append(pdf_file)
    
    merger.write(output)
    merger.close()
    output.seek(0)
    return output

def split_pdf(pdf_file, pages_per_split=1):
    pdf_file.seek(0)
    reader = PyPDF2.PdfReader(pdf_file)
    outputs = []
    
    for i in range(0, len(reader.pages), pages_per_split):
        writer = PyPDF2.PdfWriter()
        for j in range(i, min(i + pages_per_split, len(reader.pages))):
            writer.add_page(reader.pages[j])
        
        output = io.BytesIO()
        writer.write(output)
        output.seek(0)
        outputs.append(output)
    
    return outputs

def compress_pdf(pdf_file):
    pdf_file.seek(0)
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    output = io.BytesIO()
    
    # Apply compression
    doc.save(output, garbage=4, deflate=True, clean=True)
    doc.close()
    output.seek(0)
    return output

def extract_text_from_pdf(pdf_file):
    pdf_file.seek(0)
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text

def pdf_to_images(pdf_file, dpi=150):
    pdf_file.seek(0)
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    images = []
    
    for page_num in range(doc.page_count):
        page = doc[page_num]
        mat = fitz.Matrix(dpi/72, dpi/72)
        pix = page.get_pixmap(matrix=mat)
        img_data = pix.tobytes("png")
        
        image_buffer = io.BytesIO(img_data)
        images.append(image_buffer)
    
    doc.close()
    return images

# Simple image processing functions
def resize_image(image, width, height, maintain_aspect=True):
    if maintain_aspect:
        image.thumbnail((width, height), Image.Resampling.LANCZOS)
        return image
    else:
        return image.resize((width, height), Image.Resampling.LANCZOS)

def compress_image(image, quality=85):
    output = io.BytesIO()
    if image.mode in ('RGBA', 'LA', 'P'):
        rgb_image = Image.new('RGB', image.size, (255, 255, 255))
        rgb_image.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
        image = rgb_image
    image.save(output, format='JPEG', quality=quality, optimize=True)
    output.seek(0)
    return Image.open(output)

def convert_image_format(image, target_format):
    output = io.BytesIO()
    
    if target_format.upper() == 'PNG':
        image.save(output, format='PNG', optimize=True)
    elif target_format.upper() in ['JPG', 'JPEG']:
        if image.mode in ('RGBA', 'LA', 'P'):
            rgb_image = Image.new('RGB', image.size, (255, 255, 255))
            rgb_image.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = rgb_image
        image.save(output, format='JPEG', quality=95)
    elif target_format.upper() == 'WEBP':
        image.save(output, format='WEBP', quality=90)
    
    output.seek(0)
    return output

@app.route('/')
def index():
    """Enhanced homepage"""
    return render_template('index_enhanced.html', categories=TOOL_CATEGORIES)

@app.route('/tools')
def tools_dashboard():
    """Tools dashboard"""
    return render_template('tools_dashboard_enhanced.html', categories=TOOL_CATEGORIES)

@app.route('/tools/<category>')
def category_tools(category):
    """Category-specific tools page"""
    if category not in TOOL_CATEGORIES:
        return redirect(url_for('tools_dashboard'))
    
    return render_template('category_tools_simple.html', 
                         category=category, 
                         category_data=TOOL_CATEGORIES[category])

@app.route('/tool/<category>/<tool_id>')
def tool_page(category, tool_id):
    """Individual tool page"""
    if category not in TOOL_CATEGORIES:
        return redirect(url_for('tools_dashboard'))
    
    tool = None
    for t in TOOL_CATEGORIES[category]['tools']:
        if t['id'] == tool_id:
            tool = t
            break
    
    if not tool:
        return redirect(url_for('category_tools', category=category))
    
    return render_template('tool_page_simple.html', 
                         category=category,
                         category_data=TOOL_CATEGORIES[category],
                         tool=tool)

@app.route('/process/<category>/<tool_id>', methods=['POST'])
def process_tool(category, tool_id):
    """Process tool requests"""
    try:
        files = request.files.getlist('files')
        if not files:
            return jsonify({'success': False, 'error': 'No files uploaded'})
        
        if category == 'pdf':
            return process_pdf_tool(tool_id, files, request)
        elif category == 'image':
            return process_image_tool(tool_id, files, request)
        elif category == 'ai':
            return process_ai_tool(tool_id, files, request)
        elif category == 'utility':
            return process_utility_tool(tool_id, files, request)
        else:
            return jsonify({'success': False, 'error': 'Invalid category'})
    
    except Exception as e:
        logger.error(f"Processing error for {category}/{tool_id}: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

def process_pdf_tool(tool_id, files, request):
    """Process PDF tools"""
    try:
        if tool_id == 'pdf-merger':
            merged_pdf = merge_pdfs(files)
            output_filename = f"merged_pdf_{uuid.uuid4()}.pdf"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            
            with open(output_path, 'wb') as f:
                f.write(merged_pdf.read())
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': 'merged_document.pdf',
                'message': 'PDFs merged successfully!'
            })
        
        elif tool_id == 'pdf-splitter':
            pages_per_split = int(request.form.get('pages_per_split', 1))
            split_pdfs = split_pdf(files[0], pages_per_split)
            
            output_files = []
            for i, pdf in enumerate(split_pdfs):
                output_filename = f"split_part_{i+1}_{uuid.uuid4()}.pdf"
                output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
                
                with open(output_path, 'wb') as f:
                    f.write(pdf.read())
                
                output_files.append({
                    'filename': f"split_part_{i+1}.pdf",
                    'output_file': output_filename
                })
            
            return jsonify({
                'success': True,
                'output_files': output_files,
                'message': f'PDF split into {len(output_files)} parts!'
            })
        
        elif tool_id == 'pdf-compressor':
            compressed_pdf = compress_pdf(files[0])
            
            output_filename = f"compressed_pdf_{uuid.uuid4()}.pdf"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            
            with open(output_path, 'wb') as f:
                f.write(compressed_pdf.read())
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': 'compressed_document.pdf',
                'message': 'PDF compressed successfully!'
            })
        
        elif tool_id == 'pdf-to-text':
            text = extract_text_from_pdf(files[0])
            
            output_filename = f"extracted_text_{uuid.uuid4()}.txt"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(text)
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': 'extracted_text.txt',
                'text_preview': text[:500] + '...' if len(text) > 500 else text,
                'message': 'Text extracted successfully!'
            })
        
        elif tool_id == 'pdf-to-images':
            dpi = int(request.form.get('dpi', 150))
            images = pdf_to_images(files[0], dpi)
            
            output_files = []
            for i, img_buffer in enumerate(images):
                output_filename = f"page_{i+1}_{uuid.uuid4()}.png"
                output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
                
                with open(output_path, 'wb') as f:
                    f.write(img_buffer.read())
                
                output_files.append({
                    'filename': f"page_{i+1}.png",
                    'output_file': output_filename
                })
            
            return jsonify({
                'success': True,
                'output_files': output_files,
                'message': f'PDF converted to {len(output_files)} images!'
            })
        
    except Exception as e:
        logger.error(f"PDF processing error: {e}")
        return jsonify({'success': False, 'error': str(e)})

def process_image_tool(tool_id, files, request):
    """Process image tools"""
    try:
        image = Image.open(files[0])
        
        if tool_id == 'image-resize':
            width = int(request.form.get('width', image.width))
            height = int(request.form.get('height', image.height))
            maintain_aspect = request.form.get('maintain_aspect') == 'true'
            
            resized_image = resize_image(image, width, height, maintain_aspect)
            
            output_filename = f"resized_image_{uuid.uuid4()}.png"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            resized_image.save(output_path)
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': 'resized_image.png',
                'message': f'Image resized to {resized_image.width}x{resized_image.height}!'
            })
        
        elif tool_id == 'image-compress':
            quality = int(request.form.get('quality', 85))
            
            compressed_image = compress_image(image, quality)
            
            output_filename = f"compressed_image_{uuid.uuid4()}.jpg"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            compressed_image.save(output_path)
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': 'compressed_image.jpg',
                'message': 'Image compressed successfully!'
            })
        
        elif tool_id == 'format-converter':
            target_format = request.form.get('target_format', 'PNG')
            
            converted_buffer = convert_image_format(image, target_format)
            
            extension = target_format.lower()
            output_filename = f"converted_image_{uuid.uuid4()}.{extension}"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            
            with open(output_path, 'wb') as f:
                f.write(converted_buffer.read())
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': f'converted_image.{extension}',
                'message': f'Image converted to {target_format}!'
            })
        
    except Exception as e:
        logger.error(f"Image processing error: {e}")
        return jsonify({'success': False, 'error': str(e)})

def process_ai_tool(tool_id, files, request):
    """Process AI tools (simple implementations)"""
    try:
        if tool_id == 'text-analyzer':
            text_input = request.form.get('text', '')
            if not text_input and files:
                # Try to extract text from uploaded file
                if files[0].filename.endswith('.txt'):
                    text_input = files[0].read().decode('utf-8')
                elif files[0].filename.endswith('.pdf'):
                    text_input = extract_text_from_pdf(files[0])
            
            # Simple text analysis
            word_count = len(text_input.split())
            char_count = len(text_input)
            sentence_count = text_input.count('.') + text_input.count('!') + text_input.count('?')
            
            analysis = {
                'word_count': word_count,
                'character_count': char_count,
                'sentence_count': sentence_count,
                'average_word_length': sum(len(word) for word in text_input.split()) / word_count if word_count > 0 else 0,
                'readability': 'Simple' if word_count < 100 else 'Moderate' if word_count < 500 else 'Complex'
            }
            
            return jsonify({
                'success': True,
                'analysis': analysis,
                'message': 'Text analysis completed!'
            })
        
        elif tool_id == 'image-analyzer':
            image = Image.open(files[0])
            
            analysis = {
                'width': image.width,
                'height': image.height,
                'format': image.format,
                'mode': image.mode,
                'size_mb': len(files[0].read()) / (1024 * 1024),
                'aspect_ratio': round(image.width / image.height, 2)
            }
            
            return jsonify({
                'success': True,
                'analysis': analysis,
                'message': 'Image analysis completed!'
            })
        
    except Exception as e:
        logger.error(f"AI processing error: {e}")
        return jsonify({'success': False, 'error': str(e)})

def process_utility_tool(tool_id, files, request):
    """Process utility tools"""
    try:
        if tool_id == 'qr-generator':
            import qrcode
            
            data = request.form.get('data', 'Hello World')
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(data)
            qr.make(fit=True)
            
            qr_image = qr.make_image(fill_color="black", back_color="white")
            
            output_filename = f"qr_code_{uuid.uuid4()}.png"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            qr_image.save(output_path)
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': 'qr_code.png',
                'message': 'QR code generated successfully!'
            })
        
        elif tool_id == 'password-generator':
            import random
            import string
            
            length = int(request.form.get('length', 12))
            include_symbols = request.form.get('include_symbols') == 'true'
            
            characters = string.ascii_letters + string.digits
            if include_symbols:
                characters += "!@#$%^&*"
            
            password = ''.join(random.choice(characters) for _ in range(length))
            
            return jsonify({
                'success': True,
                'password': password,
                'message': 'Password generated successfully!'
            })
        
    except Exception as e:
        logger.error(f"Utility processing error: {e}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/download/<filename>')
def download_file(filename):
    """Secure file download"""
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status')
def api_status():
    """API status endpoint"""
    return jsonify({
        'status': 'operational',
        'version': '2.0.0',
        'tools': sum(len(category['tools']) for category in TOOL_CATEGORIES.values()),
        'categories': len(TOOL_CATEGORIES),
        'features': ['PDF Processing', 'Image Processing', 'AI Analysis', 'Utility Tools']
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)