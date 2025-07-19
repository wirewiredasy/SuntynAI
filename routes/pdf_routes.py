"""
PDF Toolkit Routes - Professional PDF processing endpoints
25 PDF tools with modular architecture
"""

from flask import Blueprint, request, jsonify, send_file, render_template
from werkzeug.utils import secure_filename
import os
import logging
from pdf_tools import PDFToolkit, get_pdf_tools, get_tool_categories

pdf_bp = Blueprint('pdf', __name__, url_prefix='/pdf')
pdf_toolkit = PDFToolkit()

@pdf_bp.route('/')
def pdf_home():
    """PDF Toolkit main page"""
    tools = get_pdf_tools()
    categories = get_tool_categories()
    return render_template('pdf_toolkit.html', tools=tools, categories=categories)

@pdf_bp.route('/tool/<tool_id>')
def pdf_tool_page(tool_id):
    """Individual PDF tool page"""
    tools = get_pdf_tools()
    tool = next((t for t in tools if t['id'] == tool_id), None)
    if not tool:
        return "Tool not found", 404
    return render_template('pdf_tool.html', tool=tool)

# PDF MERGER
@pdf_bp.route('/merge', methods=['POST'])
def merge_pdfs():
    """Merge multiple PDF files"""
    try:
        if 'pdfs' not in request.files:
            return jsonify({'success': False, 'error': 'No PDF files uploaded'})
        
        files = request.files.getlist('pdfs')
        if len(files) < 2:
            return jsonify({'success': False, 'error': 'At least 2 PDF files required'})
        
        # Save uploaded files temporarily
        pdf_paths = []
        for file in files:
            if file.filename and file.filename.endswith('.pdf'):
                filename = secure_filename(file.filename)
                filepath = pdf_toolkit.upload_folder / filename
                file.save(str(filepath))
                pdf_paths.append(str(filepath))
        
        if len(pdf_paths) < 2:
            return jsonify({'success': False, 'error': 'Invalid PDF files uploaded'})
        
        result = pdf_toolkit.merge_pdfs(pdf_paths)
        
        # Clean up temporary files
        for path in pdf_paths:
            try:
                os.remove(path)
            except:
                pass
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': result['message'],
                'download_url': f"/pdf/download/{os.path.basename(result['output_file'])}",
                'file_size': result['file_size']
            })
        else:
            return jsonify(result)
            
    except Exception as e:
        logging.error(f"PDF merge error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

# PDF SPLITTER
@pdf_bp.route('/split', methods=['POST'])
def split_pdf():
    """Split PDF file"""
    try:
        if 'pdf' not in request.files:
            return jsonify({'success': False, 'error': 'No PDF file uploaded'})
        
        file = request.files['pdf']
        split_type = request.form.get('split_type', 'pages')
        
        if not file.filename or not file.filename.endswith('.pdf'):
            return jsonify({'success': False, 'error': 'Invalid PDF file'})
        
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        filepath = pdf_toolkit.upload_folder / filename
        file.save(str(filepath))
        
        # Parse split parameters
        if split_type == 'pages':
            ranges_str = request.form.get('page_ranges', '1-5,6-10')
            ranges = []
            for range_str in ranges_str.split(','):
                if '-' in range_str:
                    start, end = map(int, range_str.strip().split('-'))
                    ranges.append((start, end))
        else:
            every_n = int(request.form.get('every_n', 5))
            ranges = None
        
        result = pdf_toolkit.split_pdf(
            str(filepath), 
            split_type=split_type, 
            ranges=ranges, 
            every_n=every_n if split_type == 'every_n' else None
        )
        
        # Clean up temporary file
        try:
            os.remove(str(filepath))
        except:
            pass
        
        if result['success']:
            download_urls = [f"/pdf/download/{os.path.basename(f)}" for f in result['output_files']]
            return jsonify({
                'success': True,
                'message': result['message'],
                'download_urls': download_urls,
                'total_pages': result['total_pages'],
                'files_created': len(result['output_files'])
            })
        else:
            return jsonify(result)
            
    except Exception as e:
        logging.error(f"PDF split error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

# PDF COMPRESSOR
@pdf_bp.route('/compress', methods=['POST'])
def compress_pdf():
    """Compress PDF file"""
    try:
        if 'pdf' not in request.files:
            return jsonify({'success': False, 'error': 'No PDF file uploaded'})
        
        file = request.files['pdf']
        compression_level = request.form.get('compression_level', 'medium')
        
        if not file.filename or not file.filename.endswith('.pdf'):
            return jsonify({'success': False, 'error': 'Invalid PDF file'})
        
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        filepath = pdf_toolkit.upload_folder / filename
        file.save(str(filepath))
        
        result = pdf_toolkit.compress_pdf(str(filepath), compression_level)
        
        # Clean up temporary file
        try:
            os.remove(str(filepath))
        except:
            pass
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': result['message'],
                'download_url': f"/pdf/download/{os.path.basename(result['output_file'])}",
                'original_size': result['original_size'],
                'compressed_size': result['compressed_size'],
                'compression_ratio': result['compression_ratio']
            })
        else:
            return jsonify(result)
            
    except Exception as e:
        logging.error(f"PDF compression error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

# PDF TO WORD
@pdf_bp.route('/pdf-to-word', methods=['POST'])
def pdf_to_word():
    """Convert PDF to Word"""
    try:
        if 'pdf' not in request.files:
            return jsonify({'success': False, 'error': 'No PDF file uploaded'})
        
        file = request.files['pdf']
        output_format = request.form.get('format', 'docx')
        
        if not file.filename or not file.filename.endswith('.pdf'):
            return jsonify({'success': False, 'error': 'Invalid PDF file'})
        
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        filepath = pdf_toolkit.upload_folder / filename
        file.save(str(filepath))
        
        result = pdf_toolkit.pdf_to_word(str(filepath), output_format)
        
        # Clean up temporary file
        try:
            os.remove(str(filepath))
        except:
            pass
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': result['message'],
                'download_url': f"/pdf/download/{os.path.basename(result['output_file'])}",
                'file_size': result['file_size']
            })
        else:
            return jsonify(result)
            
    except Exception as e:
        logging.error(f"PDF to Word conversion error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

# PDF TO TEXT
@pdf_bp.route('/pdf-to-text', methods=['POST'])
def pdf_to_text():
    """Extract text from PDF"""
    try:
        if 'pdf' not in request.files:
            return jsonify({'success': False, 'error': 'No PDF file uploaded'})
        
        file = request.files['pdf']
        
        if not file.filename or not file.filename.endswith('.pdf'):
            return jsonify({'success': False, 'error': 'Invalid PDF file'})
        
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        filepath = pdf_toolkit.upload_folder / filename
        file.save(str(filepath))
        
        result = pdf_toolkit.pdf_to_text(str(filepath))
        
        # Clean up temporary file
        try:
            os.remove(str(filepath))
        except:
            pass
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': result['message'],
                'download_url': f"/pdf/download/{os.path.basename(result['output_file'])}",
                'character_count': result['character_count'],
                'text_preview': result['text_preview']
            })
        else:
            return jsonify(result)
            
    except Exception as e:
        logging.error(f"PDF to text extraction error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

# TEXT TO PDF
@pdf_bp.route('/text-to-pdf', methods=['POST'])
def text_to_pdf():
    """Convert text to PDF"""
    try:
        text_content = request.form.get('text_content', '')
        font_size = int(request.form.get('font_size', 12))
        
        if not text_content.strip():
            return jsonify({'success': False, 'error': 'No text content provided'})
        
        result = pdf_toolkit.text_to_pdf(text_content, font_size)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': result['message'],
                'download_url': f"/pdf/download/{os.path.basename(result['output_file'])}"
            })
        else:
            return jsonify(result)
            
    except Exception as e:
        logging.error(f"Text to PDF conversion error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

# WATERMARK
@pdf_bp.route('/watermark', methods=['POST'])
def add_watermark():
    """Add watermark to PDF"""
    try:
        if 'pdf' not in request.files:
            return jsonify({'success': False, 'error': 'No PDF file uploaded'})
        
        file = request.files['pdf']
        watermark_text = request.form.get('watermark_text', 'CONFIDENTIAL')
        opacity = float(request.form.get('opacity', 0.3))
        rotation = int(request.form.get('rotation', 45))
        
        if not file.filename or not file.filename.endswith('.pdf'):
            return jsonify({'success': False, 'error': 'Invalid PDF file'})
        
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        filepath = pdf_toolkit.upload_folder / filename
        file.save(str(filepath))
        
        result = pdf_toolkit.add_watermark_to_pdf(str(filepath), watermark_text, opacity, rotation)
        
        # Clean up temporary file
        try:
            os.remove(str(filepath))
        except:
            pass
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': result['message'],
                'download_url': f"/pdf/download/{os.path.basename(result['output_file'])}"
            })
        else:
            return jsonify(result)
            
    except Exception as e:
        logging.error(f"PDF watermark error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

# DOWNLOAD ENDPOINT
@pdf_bp.route('/download/<filename>')
def download_file(filename):
    """Download processed PDF file"""
    try:
        file_path = pdf_toolkit.output_folder / filename
        if file_path.exists():
            return send_file(str(file_path), as_attachment=True, download_name=filename)
        else:
            return "File not found", 404
    except Exception as e:
        logging.error(f"Download error: {str(e)}")
        return "Download error", 500