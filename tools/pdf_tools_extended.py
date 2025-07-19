"""
Extended PDF Tools - Additional PDF processing functions
"""

import os
import tempfile
import csv
from flask import request
from werkzeug.utils import secure_filename
import fitz  # PyMuPDF
import logging
from datetime import datetime
import shutil
from utils.file_handler import ensure_upload_directory
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import pdfplumber

def process_pdf_to_excel(request):
    """Convert PDF to Excel format"""
    try:
        if 'file' not in request.files:
            return {'success': False, 'error': 'No file uploaded'}
        
        file = request.files['file']
        if file.filename == '':
            return {'success': False, 'error': 'No file selected'}
        
        if not file.filename.lower().endswith('.pdf'):
            return {'success': False, 'error': 'Please upload a PDF file'}
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded file
            input_path = os.path.join(temp_dir, secure_filename(file.filename))
            file.save(input_path)
            
            # Extract tables from PDF using pdfplumber
            tables_data = []
            with pdfplumber.open(input_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    tables = page.extract_tables()
                    if tables:
                        for table in tables:
                            tables_data.extend(table)
            
            if not tables_data:
                # If no tables found, extract text
                text_data = []
                with pdfplumber.open(input_path) as pdf:
                    for page in pdf.pages:
                        text = page.extract_text()
                        if text:
                            lines = text.split('\n')
                            text_data.extend([line.split()] for line in lines if line.strip())
                tables_data = text_data
            
            # Create Excel-like CSV content
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            output_filename = f'{timestamp}converted_to_excel.csv'
            output_path = os.path.join(temp_dir, output_filename)
            
            with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile)
                for row in tables_data:
                    if row:  # Skip empty rows
                        writer.writerow(row)
            
            # Save to uploads directory
            upload_dir = ensure_upload_directory()
            final_path = os.path.join(upload_dir, output_filename)
            shutil.copy2(output_path, final_path)
            
            return {
                'success': True,
                'message': 'PDF converted to Excel format successfully',
                'output_file': final_path,
                'download_url': f'/uploads/{output_filename}',
                'filename': output_filename,
                'format': 'CSV (Excel compatible)',
                'rows_extracted': len(tables_data)
            }
            
    except Exception as e:
        logging.error(f"PDF to Excel conversion error: {str(e)}")
        return {
            'success': False,
            'error': f'Failed to convert PDF to Excel: {str(e)}'
        }

def process_pdf_to_powerpoint(request):
    """Convert PDF to PowerPoint format"""
    try:
        if 'file' not in request.files:
            return {'success': False, 'error': 'No file uploaded'}
        
        file = request.files['file']
        if file.filename == '':
            return {'success': False, 'error': 'No file selected'}
        
        if not file.filename.lower().endswith('.pdf'):
            return {'success': False, 'error': 'Please upload a PDF file'}
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded file
            input_path = os.path.join(temp_dir, secure_filename(file.filename))
            file.save(input_path)
            
            # Extract content from PDF
            doc = fitz.open(input_path)
            slides_content = []
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                # Get page text
                text = page.get_text()
                
                slides_content.append({
                    'page': page_num + 1,
                    'text': text
                })
            
            doc.close()
            
            # Create a simple HTML presentation
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            output_filename = f'{timestamp}presentation.html'
            output_path = os.path.join(temp_dir, output_filename)
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>PDF to PowerPoint Conversion</title>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
                    .slide {{ 
                        page-break-after: always; 
                        border: 2px solid #ddd; 
                        padding: 40px; 
                        margin: 20px 0; 
                        background: white;
                        border-radius: 10px;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        min-height: 400px;
                    }}
                    .slide-header {{ 
                        font-size: 28px; 
                        font-weight: bold; 
                        margin-bottom: 20px; 
                        color: #2c3e50;
                        border-bottom: 3px solid #3498db;
                        padding-bottom: 10px;
                    }}
                    .slide-content {{ 
                        font-size: 16px; 
                        line-height: 1.6; 
                        color: #333;
                    }}
                    .title {{ 
                        text-align: center; 
                        color: #2c3e50; 
                        margin-bottom: 40px;
                        font-size: 36px;
                    }}
                </style>
            </head>
            <body>
                <h1 class="title">Converted Presentation from PDF</h1>
            """
            
            for slide in slides_content:
                html_content += f"""
                <div class="slide">
                    <div class="slide-header">Slide {slide['page']}</div>
                    <div class="slide-content">
                        <pre style="white-space: pre-wrap;">{slide['text'][:1000]}{'...' if len(slide['text']) > 1000 else ''}</pre>
                    </div>
                </div>
                """
            
            html_content += """
            </body>
            </html>
            """
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            # Save to uploads directory
            upload_dir = ensure_upload_directory()
            final_path = os.path.join(upload_dir, output_filename)
            shutil.copy2(output_path, final_path)
            
            return {
                'success': True,
                'message': 'PDF converted to presentation format successfully',
                'output_file': final_path,
                'download_url': f'/uploads/{output_filename}',
                'filename': output_filename,
                'format': 'HTML Presentation',
                'slides_count': len(slides_content)
            }
            
    except Exception as e:
        logging.error(f"PDF to PowerPoint conversion error: {str(e)}")
        return {
            'success': False,
            'error': f'Failed to convert PDF to PowerPoint: {str(e)}'
        }

def process_word_to_pdf(request):
    """Convert Word document to PDF"""
    try:
        if 'file' not in request.files:
            return {'success': False, 'error': 'No file uploaded'}
        
        file = request.files['file']
        if file.filename == '':
            return {'success': False, 'error': 'No file selected'}
        
        if not any(file.filename.lower().endswith(ext) for ext in ['.doc', '.docx', '.txt', '.rtf']):
            return {'success': False, 'error': 'Please upload a Word document or text file'}
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded file
            input_path = os.path.join(temp_dir, secure_filename(file.filename))
            file.save(input_path)
            
            # Read content
            content = ""
            if file.filename.lower().endswith('.txt'):
                with open(input_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            else:
                # For other formats, try basic text extraction
                try:
                    with open(input_path, 'rb') as f:
                        raw_content = f.read()
                        # Try different encodings
                        for encoding in ['utf-8', 'latin-1', 'cp1252']:
                            try:
                                content = raw_content.decode(encoding, errors='ignore')
                                break
                            except:
                                continue
                except:
                    content = "Document content could not be extracted. Please use a text file for best results."
            
            # Create PDF using reportlab
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            output_filename = f'{timestamp}converted_document.pdf'
            output_path = os.path.join(temp_dir, output_filename)
            
            c = canvas.Canvas(output_path, pagesize=letter)
            width, height = letter
            
            # Add content to PDF
            y_position = height - 50
            lines = content.split('\n')
            page_count = 1
            
            c.setFont("Helvetica", 12)
            
            for line in lines:
                if y_position < 50:  # Start new page
                    c.showPage()
                    c.setFont("Helvetica", 12)
                    y_position = height - 50
                    page_count += 1
                
                # Wrap long lines
                line = line.strip()
                if len(line) > 90:
                    for i in range(0, len(line), 90):
                        chunk = line[i:i+90]
                        if y_position < 50:
                            c.showPage()
                            c.setFont("Helvetica", 12)
                            y_position = height - 50
                            page_count += 1
                        c.drawString(50, y_position, chunk)
                        y_position -= 15
                else:
                    c.drawString(50, y_position, line)
                    y_position -= 15
            
            c.save()
            
            # Save to uploads directory
            upload_dir = ensure_upload_directory()
            final_path = os.path.join(upload_dir, output_filename)
            shutil.copy2(output_path, final_path)
            
            return {
                'success': True,
                'message': 'Document converted to PDF successfully',
                'output_file': final_path,
                'download_url': f'/uploads/{output_filename}',
                'filename': output_filename,
                'pages_count': page_count
            }
            
    except Exception as e:
        logging.error(f"Word to PDF conversion error: {str(e)}")
        return {
            'success': False,
            'error': f'Failed to convert document to PDF: {str(e)}'
        }

def process_pdf_password_remover(request):
    """Remove password from PDF"""
    try:
        if 'file' not in request.files:
            return {'success': False, 'error': 'No file uploaded'}
        
        file = request.files['file']
        password = request.form.get('password', '')
        
        if file.filename == '':
            return {'success': False, 'error': 'No file selected'}
        
        if not file.filename.lower().endswith('.pdf'):
            return {'success': False, 'error': 'Please upload a PDF file'}
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded file
            input_path = os.path.join(temp_dir, secure_filename(file.filename))
            file.save(input_path)
            
            # Try to remove password using PyMuPDF
            doc = fitz.open(input_path)
            
            if doc.needs_pass:
                if not password:
                    return {
                        'success': False,
                        'error': 'This PDF is password protected. Please provide the password.'
                    }
                
                # Try to authenticate with password
                if not doc.authenticate(password):
                    return {
                        'success': False,
                        'error': 'Incorrect password. Please try again.'
                    }
            
            # Create output without password
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            output_filename = f'{timestamp}password_removed.pdf'
            output_path = os.path.join(temp_dir, output_filename)
            
            # Save without password
            doc.save(output_path)
            doc.close()
            
            # Save to uploads directory
            upload_dir = ensure_upload_directory()
            final_path = os.path.join(upload_dir, output_filename)
            shutil.copy2(output_path, final_path)
            
            return {
                'success': True,
                'message': 'Password removed successfully',
                'output_file': final_path,
                'download_url': f'/uploads/{output_filename}',
                'filename': output_filename
            }
            
    except Exception as e:
        logging.error(f"PDF password removal error: {str(e)}")
        return {
            'success': False,
            'error': f'Failed to remove password: {str(e)}'
        }

def process_pdf_watermark(request):
    """Add watermark to PDF"""
    try:
        if 'file' not in request.files:
            return {'success': False, 'error': 'No file uploaded'}
        
        file = request.files['file']
        watermark_text = request.form.get('watermark_text', 'WATERMARK')
        opacity = float(request.form.get('opacity', 0.3))
        
        if file.filename == '':
            return {'success': False, 'error': 'No file selected'}
        
        if not file.filename.lower().endswith('.pdf'):
            return {'success': False, 'error': 'Please upload a PDF file'}
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded file
            input_path = os.path.join(temp_dir, secure_filename(file.filename))
            file.save(input_path)
            
            # Add watermark using PyMuPDF
            doc = fitz.open(input_path)
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # Get page dimensions
                rect = page.rect
                
                # Add watermark text in center
                text_point = fitz.Point(rect.width / 2, rect.height / 2)
                
                page.insert_text(text_point, watermark_text, 
                               fontsize=40, 
                               color=(opacity, opacity, opacity), 
                               rotate=45, 
                               overlay=True)
            
            # Save watermarked PDF
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            output_filename = f'{timestamp}watermarked.pdf'
            output_path = os.path.join(temp_dir, output_filename)
            
            doc.save(output_path)
            doc.close()
            
            # Save to uploads directory
            upload_dir = ensure_upload_directory()
            final_path = os.path.join(upload_dir, output_filename)
            shutil.copy2(output_path, final_path)
            
            return {
                'success': True,
                'message': 'Watermark added successfully',
                'output_file': final_path,
                'download_url': f'/uploads/{output_filename}',
                'filename': output_filename,
                'watermark_text': watermark_text,
                'pages_processed': len(doc)
            }
            
    except Exception as e:
        logging.error(f"PDF watermark error: {str(e)}")
        return {
            'success': False,
            'error': f'Failed to add watermark: {str(e)}'
        }

def process_pdf_page_extractor(request):
    """Extract specific pages from PDF"""
    try:
        if 'file' not in request.files:
            return {'success': False, 'error': 'No file uploaded'}
        
        file = request.files['file']
        pages_to_extract = request.form.get('pages', '1')
        
        if file.filename == '':
            return {'success': False, 'error': 'No file selected'}
        
        if not file.filename.lower().endswith('.pdf'):
            return {'success': False, 'error': 'Please upload a PDF file'}
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded file
            input_path = os.path.join(temp_dir, secure_filename(file.filename))
            file.save(input_path)
            
            # Parse page numbers
            page_numbers = []
            try:
                for part in pages_to_extract.split(','):
                    part = part.strip()
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        page_numbers.extend(range(start-1, end))  # Convert to 0-based
                    else:
                        page_numbers.append(int(part) - 1)  # Convert to 0-based
            except:
                return {'success': False, 'error': 'Invalid page format. Use format like: 1,3,5-7'}
            
            # Extract pages using PyMuPDF
            doc = fitz.open(input_path)
            
            if not page_numbers or max(page_numbers) >= len(doc):
                return {'success': False, 'error': f'Invalid page numbers. PDF has {len(doc)} pages.'}
            
            # Create new PDF with extracted pages
            new_doc = fitz.open()
            
            for page_num in page_numbers:
                if 0 <= page_num < len(doc):
                    page = doc.load_page(page_num)
                    new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
            
            # Save extracted PDF
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
            output_filename = f'{timestamp}extracted_pages.pdf'
            output_path = os.path.join(temp_dir, output_filename)
            
            new_doc.save(output_path)
            new_doc.close()
            doc.close()
            
            # Save to uploads directory
            upload_dir = ensure_upload_directory()
            final_path = os.path.join(upload_dir, output_filename)
            shutil.copy2(output_path, final_path)
            
            return {
                'success': True,
                'message': f'Extracted {len(page_numbers)} pages successfully',
                'output_file': final_path,
                'download_url': f'/uploads/{output_filename}',
                'filename': output_filename,
                'pages_extracted': len(page_numbers),
                'page_numbers': [p+1 for p in page_numbers]  # Convert back to 1-based for display
            }
            
    except Exception as e:
        logging.error(f"PDF page extraction error: {str(e)}")
        return {
            'success': False,
            'error': f'Failed to extract pages: {str(e)}'
        }