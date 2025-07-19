import os
import tempfile
from flask import request, jsonify
from werkzeug.utils import secure_filename
import PyPDF2
import logging
from utils.file_handler import save_uploaded_file, get_file_path
from utils.security import validate_file_type

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
            
            # Create output file
            output_filename = 'merged_document.pdf'
            output_path = os.path.join(temp_dir, output_filename)
            
            with open(output_path, 'wb') as output_file:
                merger.write(output_file)
            
            merger.close()
            
            # Save to uploads directory
            final_path = save_uploaded_file(output_path, output_filename)
            
            return {
                'success': True,
                'message': 'PDFs merged successfully',
                'output_file': final_path,
                'download_url': f'/uploads/{output_filename}'
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
                
                # Split into individual pages
                for page_num in range(total_pages):
                    pdf_writer = PyPDF2.PdfWriter()
                    pdf_writer.add_page(pdf_reader.pages[page_num])
                    
                    output_filename = f'page_{page_num + 1}.pdf'
                    output_path = os.path.join(temp_dir, output_filename)
                    
                    with open(output_path, 'wb') as output_file:
                        pdf_writer.write(output_file)
                    
                    # Save to uploads directory
                    final_path = save_uploaded_file(output_path, output_filename)
                    output_files.append({
                        'filename': output_filename,
                        'path': final_path,
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
        return {'error': 'Failed to split PDF'}

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
                
                # Save to uploads directory
                final_path = save_uploaded_file(output_path, output_filename)
                
                return {
                    'success': True,
                    'message': 'PDF compressed successfully',
                    'output_file': final_path,
                    'download_url': f'/uploads/{output_filename}',
                    'original_size': str(original_size),
                    'compressed_size': str(compressed_size)
                }
    
    except Exception as e:
        logging.error(f"PDF compressor error: {str(e)}")
        return {'error': 'Failed to compress PDF'}
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded file
            filename = secure_filename(file.filename)
            filepath = os.path.join(temp_dir, filename)
            file.save(filepath)
            
            # Get original file size
            original_size = os.path.getsize(filepath)
            
            # Compress PDF (simplified compression)
            with open(filepath, 'rb') as pdf_file:
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                pdf_writer = PyPDF2.PdfWriter()
                
                # Add all pages
                for page in pdf_reader.pages:
                    pdf_writer.add_page(page)
                
                # Apply compression
                pdf_writer.compress_identical_objects()
                
                # Create output file
                output_filename = f'compressed_{filename}'
                output_path = os.path.join(temp_dir, output_filename)
                
                with open(output_path, 'wb') as output_file:
                    pdf_writer.write(output_file)
                
                # Get compressed file size
                compressed_size = os.path.getsize(output_path)
                compression_ratio = ((original_size - compressed_size) / original_size) * 100
                
                # Save to uploads directory
                final_path = save_uploaded_file(output_path, output_filename)
                
                return {
                    'success': True,
                    'message': 'PDF compressed successfully',
                    'output_file': final_path,
                    'original_size': original_size,
                    'compressed_size': compressed_size,
                    'compression_ratio': round(compression_ratio, 2),
                    'download_url': f'/uploads/{output_filename}'
                }
    
    except Exception as e:
        logging.error(f"PDF compressor error: {str(e)}")
        return {'error': 'Failed to compress PDF'}
