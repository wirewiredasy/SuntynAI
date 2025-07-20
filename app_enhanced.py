import os
import logging
from flask import Flask, render_template, request, send_file, jsonify, redirect, url_for, flash
from werkzeug.utils import secure_filename
import tempfile
import uuid
from utils.pdf_processor import PDFProcessor
from utils.image_processor import ImageProcessor
from utils.video_processor import VideoProcessor
from utils.audio_processor import AudioProcessor
from PIL import Image
import io

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-suntyn-ai")
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

# Tool categories with enhanced functionality
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
            {'id': 'pdf-watermark', 'name': 'Add Watermark', 'desc': 'Add text watermark to PDF', 'icon': 'fas fa-stamp'},
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
            {'id': 'bg-remover', 'name': 'Background Remover', 'desc': 'Remove image backgrounds with AI', 'icon': 'fas fa-magic'},
            {'id': 'image-filters', 'name': 'Image Filters', 'desc': 'Apply professional filters', 'icon': 'fas fa-palette'},
            {'id': 'image-rotate', 'name': 'Image Rotator', 'desc': 'Rotate and flip images', 'icon': 'fas fa-redo'},
            {'id': 'image-watermark', 'name': 'Add Watermark', 'desc': 'Add text watermarks to images', 'icon': 'fas fa-stamp'},
        ]
    },
    'video': {
        'name': 'Video Tools',
        'icon': 'fas fa-video',
        'color': 'green',
        'description': 'Professional video processing and conversion',
        'tools': [
            {'id': 'video-converter', 'name': 'Video Converter', 'desc': 'Convert video formats', 'icon': 'fas fa-exchange-alt'},
            {'id': 'audio-extractor', 'name': 'Audio Extractor', 'desc': 'Extract audio from videos', 'icon': 'fas fa-music'},
            {'id': 'video-compressor', 'name': 'Video Compressor', 'desc': 'Compress video files', 'icon': 'fas fa-compress'},
            {'id': 'gif-creator', 'name': 'GIF Creator', 'desc': 'Create GIFs from videos', 'icon': 'fas fa-film'},
            {'id': 'video-trimmer', 'name': 'Video Trimmer', 'desc': 'Trim video clips', 'icon': 'fas fa-cut'},
        ]
    },
    'audio': {
        'name': 'Audio Tools',
        'icon': 'fas fa-music',
        'color': 'purple',
        'description': 'Professional audio processing and editing',
        'tools': [
            {'id': 'audio-converter', 'name': 'Audio Converter', 'desc': 'Convert audio formats', 'icon': 'fas fa-exchange-alt'},
            {'id': 'audio-speed', 'name': 'Speed Changer', 'desc': 'Change audio playback speed', 'icon': 'fas fa-tachometer-alt'},
            {'id': 'audio-volume', 'name': 'Volume Adjuster', 'desc': 'Adjust audio volume levels', 'icon': 'fas fa-volume-up'},
            {'id': 'audio-trimmer', 'name': 'Audio Trimmer', 'desc': 'Trim audio clips', 'icon': 'fas fa-cut'},
            {'id': 'audio-merger', 'name': 'Audio Merger', 'desc': 'Merge multiple audio files', 'icon': 'fas fa-plus'},
            {'id': 'audio-normalizer', 'name': 'Audio Normalizer', 'desc': 'Normalize audio levels', 'icon': 'fas fa-adjust'},
        ]
    }
}

@app.route('/')
def index():
    """Enhanced homepage with demo video and animations"""
    return render_template('index_enhanced.html', categories=TOOL_CATEGORIES)

@app.route('/tools')
def tools_dashboard():
    """Tools dashboard with categories"""
    return render_template('tools_dashboard_enhanced.html', categories=TOOL_CATEGORIES)

@app.route('/tools/<category>')
def category_tools(category):
    """Category-specific tools page"""
    if category not in TOOL_CATEGORIES:
        return redirect(url_for('tools_dashboard'))
    
    return render_template('category_tools_enhanced.html', 
                         category=category, 
                         category_data=TOOL_CATEGORIES[category])

@app.route('/tool/<category>/<tool_id>')
def tool_page(category, tool_id):
    """Individual tool page"""
    if category not in TOOL_CATEGORIES:
        return redirect(url_for('tools_dashboard'))
    
    # Find the tool
    tool = None
    for t in TOOL_CATEGORIES[category]['tools']:
        if t['id'] == tool_id:
            tool = t
            break
    
    if not tool:
        return redirect(url_for('category_tools', category=category))
    
    return render_template('tool_page_enhanced.html', 
                         category=category,
                         category_data=TOOL_CATEGORIES[category],
                         tool=tool)

@app.route('/process/<category>/<tool_id>', methods=['POST'])
def process_tool(category, tool_id):
    """Enhanced tool processing with real functionality"""
    try:
        if category == 'pdf':
            return process_pdf_tool(tool_id, request)
        elif category == 'image':
            return process_image_tool(tool_id, request)
        elif category == 'video':
            return process_video_tool(tool_id, request)
        elif category == 'audio':
            return process_audio_tool(tool_id, request)
        else:
            return jsonify({'success': False, 'error': 'Invalid category'})
    
    except Exception as e:
        logger.error(f"Processing error for {category}/{tool_id}: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

def process_pdf_tool(tool_id, request):
    """Process PDF tools with real functionality"""
    files = request.files.getlist('files')
    if not files:
        return jsonify({'success': False, 'error': 'No files uploaded'})
    
    try:
        if tool_id == 'pdf-merger':
            merged_pdf = PDFProcessor.merge_pdfs(files)
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
            split_pdfs = PDFProcessor.split_pdf(files[0], pages_per_split)
            
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
            compression_level = float(request.form.get('compression_level', 0.7))
            compressed_pdf = PDFProcessor.compress_pdf(files[0], compression_level)
            
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
            text = PDFProcessor.extract_text(files[0])
            
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
            images = PDFProcessor.pdf_to_images(files[0], dpi)
            
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
        
        elif tool_id == 'pdf-watermark':
            watermark_text = request.form.get('watermark_text', 'CONFIDENTIAL')
            position = request.form.get('position', 'center')
            
            watermarked_pdf = PDFProcessor.add_watermark(files[0], watermark_text, position)
            
            output_filename = f"watermarked_pdf_{uuid.uuid4()}.pdf"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            
            with open(output_path, 'wb') as f:
                f.write(watermarked_pdf.read())
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': 'watermarked_document.pdf',
                'message': 'Watermark added successfully!'
            })
        
    except Exception as e:
        logger.error(f"PDF processing error: {e}")
        return jsonify({'success': False, 'error': str(e)})

def process_image_tool(tool_id, request):
    """Process image tools with real functionality"""
    files = request.files.getlist('files')
    if not files:
        return jsonify({'success': False, 'error': 'No files uploaded'})
    
    try:
        image = Image.open(files[0])
        
        if tool_id == 'image-resize':
            width = int(request.form.get('width', image.width))
            height = int(request.form.get('height', image.height))
            maintain_aspect = request.form.get('maintain_aspect') == 'true'
            
            resized_image = ImageProcessor.resize_image(image, width, height, maintain_aspect)
            
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
            format_type = request.form.get('format', 'JPEG')
            
            compressed_image = ImageProcessor.compress_image(image, quality, format_type)
            
            extension = 'jpg' if format_type == 'JPEG' else 'png'
            output_filename = f"compressed_image_{uuid.uuid4()}.{extension}"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            compressed_image.save(output_path)
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': f'compressed_image.{extension}',
                'message': 'Image compressed successfully!'
            })
        
        elif tool_id == 'format-converter':
            target_format = request.form.get('target_format', 'PNG')
            
            converted_buffer = ImageProcessor.convert_format(image, target_format)
            
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
        
        elif tool_id == 'bg-remover':
            bg_removed_image = ImageProcessor.remove_background(image)
            
            output_filename = f"bg_removed_{uuid.uuid4()}.png"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            bg_removed_image.save(output_path)
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': 'bg_removed_image.png',
                'message': 'Background removed successfully!'
            })
        
        elif tool_id == 'image-filters':
            filter_type = request.form.get('filter_type', 'blur')
            
            filtered_image = ImageProcessor.apply_filter(image, filter_type)
            
            output_filename = f"filtered_image_{uuid.uuid4()}.png"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            filtered_image.save(output_path)
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': f'{filter_type}_filtered_image.png',
                'message': f'{filter_type.title()} filter applied successfully!'
            })
        
        elif tool_id == 'image-watermark':
            watermark_text = request.form.get('watermark_text', 'SUNTYN AI')
            position = request.form.get('position', 'bottom-right')
            opacity = float(request.form.get('opacity', 0.5))
            
            watermarked_image = ImageProcessor.add_watermark(image, watermark_text, position, opacity)
            
            output_filename = f"watermarked_image_{uuid.uuid4()}.png"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            watermarked_image.save(output_path)
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': 'watermarked_image.png',
                'message': 'Watermark added successfully!'
            })
        
    except Exception as e:
        logger.error(f"Image processing error: {e}")
        return jsonify({'success': False, 'error': str(e)})

def process_video_tool(tool_id, request):
    """Process video tools with real functionality"""
    files = request.files.getlist('files')
    if not files:
        return jsonify({'success': False, 'error': 'No files uploaded'})
    
    try:
        if tool_id == 'audio-extractor':
            audio_data = VideoProcessor.extract_audio(files[0])
            
            output_filename = f"extracted_audio_{uuid.uuid4()}.mp3"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            
            with open(output_path, 'wb') as f:
                f.write(audio_data.read())
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': 'extracted_audio.mp3',
                'message': 'Audio extracted successfully!'
            })
        
        elif tool_id == 'video-converter':
            output_format = request.form.get('output_format', 'mp4')
            quality = request.form.get('quality', 'medium')
            
            converted_video = VideoProcessor.convert_format(files[0], output_format, quality)
            
            output_filename = f"converted_video_{uuid.uuid4()}.{output_format}"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            
            with open(output_path, 'wb') as f:
                f.write(converted_video.read())
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': f'converted_video.{output_format}',
                'message': f'Video converted to {output_format.upper()}!'
            })
        
        elif tool_id == 'gif-creator':
            fps = int(request.form.get('fps', 10))
            duration = request.form.get('duration')
            duration = float(duration) if duration else None
            
            gif_data = VideoProcessor.create_gif(files[0], fps, duration)
            
            output_filename = f"created_gif_{uuid.uuid4()}.gif"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            
            with open(output_path, 'wb') as f:
                f.write(gif_data.read())
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': 'created_animation.gif',
                'message': 'GIF created successfully!'
            })
        
    except Exception as e:
        logger.error(f"Video processing error: {e}")
        return jsonify({'success': False, 'error': str(e)})

def process_audio_tool(tool_id, request):
    """Process audio tools with real functionality"""
    files = request.files.getlist('files')
    if not files:
        return jsonify({'success': False, 'error': 'No files uploaded'})
    
    try:
        if tool_id == 'audio-converter':
            input_format = files[0].filename.split('.')[-1]
            output_format = request.form.get('output_format', 'mp3')
            
            converted_audio = AudioProcessor.convert_format(files[0], input_format, output_format)
            
            output_filename = f"converted_audio_{uuid.uuid4()}.{output_format}"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            
            with open(output_path, 'wb') as f:
                f.write(converted_audio.read())
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': f'converted_audio.{output_format}',
                'message': f'Audio converted to {output_format.upper()}!'
            })
        
        elif tool_id == 'audio-speed':
            speed_factor = float(request.form.get('speed_factor', 1.0))
            input_format = files[0].filename.split('.')[-1]
            
            speed_changed_audio = AudioProcessor.change_speed(files[0], speed_factor, input_format)
            
            output_filename = f"speed_changed_audio_{uuid.uuid4()}.mp3"
            output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
            
            with open(output_path, 'wb') as f:
                f.write(speed_changed_audio.read())
            
            return jsonify({
                'success': True,
                'output_file': output_filename,
                'filename': 'speed_changed_audio.mp3',
                'message': f'Audio speed changed by {speed_factor}x!'
            })
        
    except Exception as e:
        logger.error(f"Audio processing error: {e}")
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
        'categories': len(TOOL_CATEGORIES)
    })

if __name__ == '__main__':
    # Ensure utils directory exists
    os.makedirs('utils', exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)