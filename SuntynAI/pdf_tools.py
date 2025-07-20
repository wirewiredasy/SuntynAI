"""
PDF Toolkit - Professional PDF Tools Suite
25 Advanced PDF Tools with modular backend processing
"""

import os
import logging
import fitz  # PyMuPDF
import pikepdf
try:
    import camelot
except ImportError:
    camelot = None
from pathlib import Path
from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.utils import ImageReader
from PyPDF2 import PdfMerger, PdfReader, PdfWriter
from pdf2docx import Converter
from docx2pdf import convert
from fpdf import FPDF
import pdfplumber
import pandas as pd
from werkzeug.utils import secure_filename
from io import BytesIO
import base64
import json

class PDFToolkit:
    """Professional PDF Toolkit with 25+ tools"""
    
    def __init__(self, upload_folder='uploads', output_folder='outputs'):
        self.upload_folder = Path(upload_folder)
        self.output_folder = Path(output_folder)
        self.upload_folder.mkdir(exist_ok=True)
        self.output_folder.mkdir(exist_ok=True)
        
    def get_timestamp_filename(self, base_name, extension):
        """Generate unique filename with timestamp"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{base_name}_{timestamp}.{extension}"
    
    # 1. PDF MERGER
    def merge_pdfs(self, pdf_files, output_name="merged"):
        """Merge multiple PDF files into one"""
        try:
            merger = PdfMerger()
            output_path = self.output_folder / self.get_timestamp_filename(output_name, "pdf")
            
            for pdf_file in pdf_files:
                merger.append(pdf_file)
            
            merger.write(str(output_path))
            merger.close()
            
            return {
                'success': True,
                'message': f'Successfully merged {len(pdf_files)} PDFs',
                'output_file': str(output_path),
                'file_size': os.path.getsize(output_path)
            }
        except Exception as e:
            logging.error(f"PDF merge error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # 2. PDF SPLITTER
    def split_pdf(self, pdf_file, split_type="pages", ranges=None, every_n=None):
        """Split PDF by pages, ranges, or every N pages"""
        try:
            reader = PdfReader(pdf_file)
            total_pages = len(reader.pages)
            output_files = []
            
            if split_type == "pages" and ranges:
                # Split by specific page ranges
                for i, page_range in enumerate(ranges):
                    writer = PdfWriter()
                    start, end = page_range
                    for page_num in range(start-1, min(end, total_pages)):
                        writer.add_page(reader.pages[page_num])
                    
                    output_path = self.output_folder / self.get_timestamp_filename(f"split_part_{i+1}", "pdf")
                    with open(output_path, 'wb') as output_file:
                        writer.write(output_file)
                    output_files.append(str(output_path))
                    
            elif split_type == "every_n" and every_n:
                # Split every N pages
                for i in range(0, total_pages, every_n):
                    writer = PdfWriter()
                    for page_num in range(i, min(i + every_n, total_pages)):
                        writer.add_page(reader.pages[page_num])
                    
                    output_path = self.output_folder / self.get_timestamp_filename(f"split_every_{every_n}_part_{i//every_n + 1}", "pdf")
                    with open(output_path, 'wb') as output_file:
                        writer.write(output_file)
                    output_files.append(str(output_path))
            
            return {
                'success': True,
                'message': f'Successfully split PDF into {len(output_files)} files',
                'output_files': output_files,
                'total_pages': total_pages
            }
            
        except Exception as e:
            logging.error(f"PDF split error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # 3. PDF COMPRESSOR
    def compress_pdf(self, pdf_file, compression_level="medium"):
        """Compress PDF file with different compression levels"""
        try:
            doc = fitz.open(pdf_file)
            output_path = self.output_folder / self.get_timestamp_filename("compressed", "pdf")
            
            # Compression settings
            if compression_level == "light":
                options = {"deflate": True, "deflate_images": True, "garbage": 1}
            elif compression_level == "medium":
                options = {"deflate": True, "deflate_images": True, "garbage": 3, "clean": True}
            elif compression_level == "heavy":
                options = {"deflate": True, "deflate_images": True, "garbage": 4, "clean": True, "ascii": True}
            else:
                options = {"deflate": True, "deflate_images": True, "garbage": 2}
            
            doc.save(str(output_path), **options)
            doc.close()
            
            original_size = os.path.getsize(pdf_file) if hasattr(pdf_file, 'name') else 0
            compressed_size = os.path.getsize(output_path)
            compression_ratio = round((1 - compressed_size/max(original_size, 1)) * 100, 1)
            
            return {
                'success': True,
                'message': f'PDF compressed successfully - {compression_ratio}% reduction',
                'output_file': str(output_path),
                'original_size': original_size,
                'compressed_size': compressed_size,
                'compression_ratio': compression_ratio
            }
            
        except Exception as e:
            logging.error(f"PDF compression error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # 4. PDF TO WORD
    def pdf_to_word(self, pdf_file, output_format="docx"):
        """Convert PDF to Word document"""
        try:
            output_path = self.output_folder / self.get_timestamp_filename("converted", output_format)
            
            cv = Converter(pdf_file)
            cv.convert(str(output_path))
            cv.close()
            
            return {
                'success': True,
                'message': f'PDF successfully converted to {output_format.upper()}',
                'output_file': str(output_path),
                'file_size': os.path.getsize(output_path)
            }
            
        except Exception as e:
            logging.error(f"PDF to Word conversion error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # 5. PDF TO EXCEL
    def pdf_to_excel(self, pdf_file, extract_method="camelot"):
        """Extract tables from PDF to Excel"""
        try:
            if extract_method == "camelot" and camelot:
                tables = camelot.read_pdf(pdf_file, pages='all')
                if len(tables) > 0:
                    output_path = self.output_folder / self.get_timestamp_filename("tables_extracted", "xlsx")
                    
                    with pd.ExcelWriter(str(output_path), engine='openpyxl') as writer:
                        for i, table in enumerate(tables):
                            table.df.to_excel(writer, sheet_name=f'Table_{i+1}', index=False)
                    
                    return {
                        'success': True,
                        'message': f'Extracted {len(tables)} tables to Excel',
                        'output_file': str(output_path),
                        'tables_found': len(tables)
                    }
                else:
                    return {'success': False, 'error': 'No tables found in the PDF'}
            
        except Exception as e:
            logging.error(f"PDF to Excel conversion error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # 6. PDF PASSWORD REMOVER
    def remove_pdf_password(self, pdf_file, password):
        """Remove password from PDF file"""
        try:
            with pikepdf.open(pdf_file, password=password) as pdf:
                output_path = self.output_folder / self.get_timestamp_filename("unlocked", "pdf")
                pdf.save(str(output_path))
                
            return {
                'success': True,
                'message': 'Password successfully removed from PDF',
                'output_file': str(output_path)
            }
            
        except pikepdf.PasswordError:
            return {'success': False, 'error': 'Incorrect password provided'}
        except Exception as e:
            logging.error(f"PDF password removal error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # 7. PDF PASSWORD PROTECTOR
    def protect_pdf_with_password(self, pdf_file, password):
        """Add password protection to PDF"""
        try:
            reader = PdfReader(pdf_file)
            writer = PdfWriter()
            
            for page in reader.pages:
                writer.add_page(page)
            
            writer.encrypt(password)
            
            output_path = self.output_folder / self.get_timestamp_filename("protected", "pdf")
            with open(output_path, 'wb') as output_file:
                writer.write(output_file)
                
            return {
                'success': True,
                'message': 'PDF successfully protected with password',
                'output_file': str(output_path)
            }
            
        except Exception as e:
            logging.error(f"PDF password protection error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # 8. PDF WATERMARK
    def add_watermark_to_pdf(self, pdf_file, watermark_text="", opacity=0.3, rotation=45):
        """Add text watermark to PDF"""
        try:
            doc = fitz.open(pdf_file)
            output_path = self.output_folder / self.get_timestamp_filename("watermarked", "pdf")
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                rect = page.rect
                
                # Add text watermark
                if watermark_text:
                    page.insert_text(
                        (rect.width/2, rect.height/2),
                        watermark_text,
                        fontsize=48,
                        rotate=rotation,
                        color=(0.5, 0.5, 0.5),
                        overlay=True
                    )
            
            doc.save(str(output_path))
            doc.close()
            
            return {
                'success': True,
                'message': 'Watermark successfully added to PDF',
                'output_file': str(output_path)
            }
            
        except Exception as e:
            logging.error(f"PDF watermark error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # 9. PDF TO TEXT
    def pdf_to_text(self, pdf_file):
        """Extract text from PDF"""
        try:
            text_content = ""
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    text_content += page.extract_text() + "\n\n"
            
            output_path = self.output_folder / self.get_timestamp_filename("extracted_text", "txt")
            with open(output_path, 'w', encoding='utf-8') as text_file:
                text_file.write(text_content)
                
            return {
                'success': True,
                'message': 'Text successfully extracted from PDF',
                'output_file': str(output_path),
                'character_count': len(text_content),
                'text_preview': text_content[:500] + "..." if len(text_content) > 500 else text_content
            }
            
        except Exception as e:
            logging.error(f"PDF to text extraction error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # 10. TEXT TO PDF
    def text_to_pdf(self, text_content, font_size=12):
        """Convert text to PDF"""
        try:
            output_path = self.output_folder / self.get_timestamp_filename("text_to_pdf", "pdf")
            
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Arial", size=font_size)
            
            # Split text into lines and add to PDF
            lines = text_content.split('\n')
            for line in lines:
                pdf.cell(0, 10, line.encode('latin-1', 'replace').decode('latin-1'), ln=True)
            
            pdf.output(str(output_path))
            
            return {
                'success': True,
                'message': 'Text successfully converted to PDF',
                'output_file': str(output_path)
            }
            
        except Exception as e:
            logging.error(f"Text to PDF conversion error: {str(e)}")
            return {'success': False, 'error': str(e)}

    # Additional tools can be added here following the same pattern...

# Tool definitions for the frontend
PDF_TOOLS = [
    {
        'id': 'pdf-merger',
        'name': 'PDF Merger',
        'description': 'Merge multiple PDF files into one document',
        'icon': 'ti-files',
        'category': 'merge',
        'popular': True
    },
    {
        'id': 'pdf-splitter',
        'name': 'PDF Splitter',
        'description': 'Split PDF into separate pages or ranges',
        'icon': 'ti-cut',
        'category': 'split',
        'popular': True
    },
    {
        'id': 'pdf-compressor',
        'name': 'PDF Compressor',
        'description': 'Reduce PDF file size while maintaining quality',
        'icon': 'ti-package',
        'category': 'optimize',
        'popular': True
    },
    {
        'id': 'pdf-to-word',
        'name': 'PDF to Word',
        'description': 'Convert PDF to editable Word document',
        'icon': 'ti-file-text',
        'category': 'convert',
        'popular': True
    },
    {
        'id': 'pdf-to-excel',
        'name': 'PDF to Excel',
        'description': 'Extract tables from PDF to Excel spreadsheet',
        'icon': 'ti-table',
        'category': 'convert',
        'popular': False
    },
    {
        'id': 'pdf-password-remover',
        'name': 'Unlock PDF',
        'description': 'Remove password protection from PDF',
        'icon': 'ti-lock-open',
        'category': 'security',
        'popular': False
    },
    {
        'id': 'pdf-password-protector',
        'name': 'Protect PDF',
        'description': 'Add password protection to PDF',
        'icon': 'ti-lock',
        'category': 'security',
        'popular': False
    },
    {
        'id': 'pdf-watermark',
        'name': 'PDF Watermark',
        'description': 'Add text or image watermark to PDF',
        'icon': 'ti-droplet',
        'category': 'edit',
        'popular': False
    },
    {
        'id': 'pdf-to-text',
        'name': 'PDF to Text',
        'description': 'Extract all text content from PDF',
        'icon': 'ti-text-recognition',
        'category': 'extract',
        'popular': False
    },
    {
        'id': 'text-to-pdf',
        'name': 'Text to PDF',
        'description': 'Convert plain text to PDF document',
        'icon': 'ti-file-plus',
        'category': 'convert',
        'popular': False
    }
]

def get_pdf_tools():
    """Return list of available PDF tools"""
    return PDF_TOOLS

def get_tool_categories():
    """Return PDF tool categories"""
    return [
        {'id': 'all', 'name': 'All Tools', 'count': len(PDF_TOOLS)},
        {'id': 'merge', 'name': 'Merge & Split', 'count': 2},
        {'id': 'convert', 'name': 'Convert', 'count': 4},
        {'id': 'optimize', 'name': 'Optimize', 'count': 1},
        {'id': 'security', 'name': 'Security', 'count': 2},
        {'id': 'edit', 'name': 'Edit', 'count': 1},
    ]