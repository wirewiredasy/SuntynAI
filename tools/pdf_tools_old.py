import os
import tempfile
import io
from flask import request, jsonify
from werkzeug.utils import secure_filename
import PyPDF2
import fitz  # PyMuPDF
import logging
from datetime import datetime
import shutil
from utils.file_handler import save_uploaded_file, get_file_path, ensure_upload_directory
from utils.security import validate_file_type
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import pdfplumber

def process_pdf_merger(request):
    """Process PDF merger tool"""
    try:
        if 'files' not in request.files:
            return {'error': 'No files provided'}
        
        files = request.files.getlist('files')
        if len(files) < 2:
            return {'error': 'At least 2 PDF files required'}
        
        # Validate all files
        for file in files:
            if not validate_file_type(file.filename, ['pdf']):
                return {'error': f'Invalid file type: {file.filename}'}
        
        # Create temporary directory for processing
        with tempfile.TemporaryDirectory() as temp_dir:
            merger = PyPDF2.PdfMerger()
            
            # Save and process each file
            for file in files:
                filename = secure_filename(file.filename)
                filepath = os.path.join(temp_dir, filename)
                file.save(filepath)
                
                # Add to merger
                merger.append(filepath)
            
            # Generate unique filename with timestamp
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            output_filename = f'{timestamp}merged_document.pdf'
            output_path = os.path.join(temp_dir, output_filename)
            
            with open(output_path, 'wb') as output_file:
                merger.write(output_file)
            
            merger.close()
            
            # Save to uploads directory
            upload_dir = ensure_upload_directory()
            final_path = os.path.join(upload_dir, output_filename)
            shutil.copy2(output_path, final_path)
            
            return {
                'success': True,
                'message': 'PDFs merged successfully',
                'output_file': final_path,
                'download_url': f'/uploads/{output_filename}',
                'filename': output_filename,
                'file_count': len(files)
            }
    
    except Exception as e:
        logging.error(f"PDF merger error: {str(e)}")
        return {'error': 'Failed to merge PDFs'}

def process_pdf_splitter(request):
    """Process PDF splitter tool"""
    try:
        if 'file' not in request.files:
            return {'error': 'No file provided'}
        
        file = request.files['file']
        if not validate_file_type(file.filename, ['pdf']):
            return {'error': 'Invalid file type'}
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded file
            filename = secure_filename(file.filename)
            filepath = os.path.join(temp_dir, filename)
            file.save(filepath)
            
            # Read PDF
            with open(filepath, 'rb') as pdf_file:
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                total_pages = len(pdf_reader.pages)
                
                output_files = []
                
                # Get split options
                split_type = request.form.get('split_type', 'all')
                
                if split_type == 'range':
                    # Split by page range
                    start_page = max(1, int(request.form.get('start_page', 1))) - 1
                    end_page = min(total_pages, int(request.form.get('end_page', total_pages))) - 1
                    
                    pdf_writer = PyPDF2.PdfWriter()
                    for page_num in range(start_page, end_page + 1):
                        pdf_writer.add_page(pdf_reader.pages[page_num])
                    
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
                    output_filename = f'{timestamp}pages_{start_page+1}_to_{end_page+1}.pdf'
                    output_path = os.path.join(temp_dir, output_filename)
                    
                    with open(output_path, 'wb') as output_file:
                        pdf_writer.write(output_file)
                    
                    # Save to uploads directory
                    upload_dir = ensure_upload_directory()
                    final_path = os.path.join(upload_dir, output_filename)
                    shutil.copy2(output_path, final_path)
                    
                    output_files.append({
                        'filename': output_filename,
                        'path': final_path,
                        'download_url': f'/uploads/{output_filename}',
                        'pages': f'{start_page+1}-{end_page+1}'
                    })
                    
                elif split_type == 'every':
                    # Split every N pages
                    every_n = int(request.form.get('every_n', 2))
                    part_num = 1
                    
                    for start_page in range(0, total_pages, every_n):
                        end_page = min(start_page + every_n - 1, total_pages - 1)
                        
                        pdf_writer = PyPDF2.PdfWriter()
                        for page_num in range(start_page, end_page + 1):
                            pdf_writer.add_page(pdf_reader.pages[page_num])
                        
                        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
                        output_filename = f'{timestamp}part_{part_num}.pdf'
                        output_path = os.path.join(temp_dir, output_filename)
                        
                        with open(output_path, 'wb') as output_file:
                            pdf_writer.write(output_file)
                        
                        # Save to uploads directory
                        upload_dir = ensure_upload_directory()
                        final_path = os.path.join(upload_dir, output_filename)
                        shutil.copy2(output_path, final_path)
                        
                        output_files.append({
                            'filename': output_filename,
                            'path': final_path,
                            'download_url': f'/uploads/{output_filename}',
                            'pages': f'{start_page+1}-{end_page+1}'
                        })
                        part_num += 1
                else:
                    # Split into individual pages (default)
                    for page_num in range(total_pages):
                        pdf_writer = PyPDF2.PdfWriter()
                        pdf_writer.add_page(pdf_reader.pages[page_num])
                        
                        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
                        output_filename = f'{timestamp}page_{page_num + 1}.pdf'
                        output_path = os.path.join(temp_dir, output_filename)
                        
                        with open(output_path, 'wb') as output_file:
                            pdf_writer.write(output_file)
                        
                        # Save to uploads directory
                        upload_dir = ensure_upload_directory()
                        final_path = os.path.join(upload_dir, output_filename)
                        shutil.copy2(output_path, final_path)
                        
                        output_files.append({
                            'filename': output_filename,
                            'path': final_path,
                            'download_url': f'/uploads/{output_filename}',
                            'page': page_num + 1
                        })
                
                return {
                    'success': True,
                    'message': f'PDF split into {total_pages} pages',
                    'output_files': output_files,
                    'total_pages': total_pages
                }
    
    except Exception as e:
        logging.error(f"PDF splitter error: {str(e)}")
        return {'success': False, 'error': f'Failed to split PDF: {str(e)}'}

def process_pdf_compressor(request):
    """Process PDF compressor tool"""
    try:
        if 'file' not in request.files:
            return {'error': 'No file provided'}
        
        file = request.files['file']
        if not validate_file_type(file.filename, ['pdf']):
            return {'error': 'Invalid file type'}
        
        compression_level = request.form.get('compression_level', 'medium')
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded file
            filename = secure_filename(file.filename)
            filepath = os.path.join(temp_dir, filename)
            file.save(filepath)
            
            # Get original file size
            original_size = os.path.getsize(filepath)
            
            # Read and rewrite PDF (basic compression)
            with open(filepath, 'rb') as pdf_file:
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                pdf_writer = PyPDF2.PdfWriter()
                
                # Add all pages
                for page in pdf_reader.pages:
                    pdf_writer.add_page(page)
                
                # Apply compression based on level
                if compression_level in ['high', 'extreme']:
                    pdf_writer.compress_identical_objects()
                
                # Create output file
                output_filename = f'compressed_{filename}'
                output_path = os.path.join(temp_dir, output_filename)
                
                with open(output_path, 'wb') as output_file:
                    pdf_writer.write(output_file)
                
                # Get compressed file size
                compressed_size = os.path.getsize(output_path)
                
                # Generate unique filename with timestamp
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
                final_filename = f"{timestamp}compressed_{filename}"
                
                # Save to uploads directory
                upload_dir = ensure_upload_directory()
                final_path = os.path.join(upload_dir, final_filename)
                shutil.copy2(output_path, final_path)
                
                # Calculate compression ratio
                compression_ratio = ((original_size - compressed_size) / original_size) * 100 if original_size > 0 else 0
                
                return {
                    'success': True,
                    'message': 'PDF compressed successfully',
                    'output_file': final_path,
                    'download_url': f'/uploads/{final_filename}',
                    'original_size': str(original_size),
                    'compressed_size': str(compressed_size),
                    'compression_ratio': round(compression_ratio, 2),
                    'filename': final_filename
                }
    
    except Exception as e:
        logging.error(f"PDF compressor error: {str(e)}")
        return {'success': False, 'error': f'Failed to compress PDF: {str(e)}'}
