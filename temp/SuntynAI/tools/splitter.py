"""
PDF Splitter Tool - Split PDFs into multiple files
"""
import os
import tempfile
from PyPDF2 import PdfReader, PdfWriter
from werkzeug.utils import secure_filename

def split_pdf_by_pages(file, page_ranges):
    """
    Split PDF by page ranges (e.g., "1-3,4-6,7-10")
    
    Args:
        file: PDF file object
        page_ranges: String like "1-3,4-6" or list of tuples
    
    Returns:
        tuple: (success: bool, output_files: list, error: str)
    """
    try:
        # Create temporary directory
        temp_dir = tempfile.mkdtemp()
        
        # Save uploaded file temporarily
        input_path = os.path.join(temp_dir, secure_filename(file.filename))
        file.save(input_path)
        
        reader = PdfReader(input_path)
        total_pages = len(reader.pages)
        
        # Parse page ranges
        if isinstance(page_ranges, str):
            ranges = parse_page_ranges(page_ranges, total_pages)
        else:
            ranges = page_ranges
        
        output_files = []
        
        for i, (start, end) in enumerate(ranges):
            writer = PdfWriter()
            
            # Add pages to writer (convert to 0-based indexing)
            for page_num in range(start - 1, min(end, total_pages)):
                writer.add_page(reader.pages[page_num])
            
            # Create output file
            output_filename = f"split_part_{i + 1}_pages_{start}-{end}.pdf"
            output_path = os.path.join(temp_dir, output_filename)
            
            with open(output_path, 'wb') as output_file:
                writer.write(output_file)
            
            output_files.append({
                'path': output_path,
                'filename': output_filename,
                'pages': f"{start}-{end}",
                'size': os.path.getsize(output_path)
            })
        
        return True, output_files, f"Split into {len(output_files)} files"
        
    except Exception as e:
        return False, [], f"Error splitting PDF: {str(e)}"

def split_pdf_every_n_pages(file, n_pages):
    """
    Split PDF every N pages
    
    Args:
        file: PDF file object
        n_pages: Number of pages per split file
    
    Returns:
        tuple: (success: bool, output_files: list, error: str)
    """
    try:
        # Create temporary directory
        temp_dir = tempfile.mkdtemp()
        
        # Save uploaded file temporarily
        input_path = os.path.join(temp_dir, secure_filename(file.filename))
        file.save(input_path)
        
        reader = PdfReader(input_path)
        total_pages = len(reader.pages)
        
        output_files = []
        
        for i in range(0, total_pages, n_pages):
            writer = PdfWriter()
            
            # Add N pages to writer
            end_page = min(i + n_pages, total_pages)
            for page_num in range(i, end_page):
                writer.add_page(reader.pages[page_num])
            
            # Create output file
            start_page_num = i + 1
            end_page_num = end_page
            output_filename = f"split_pages_{start_page_num}-{end_page_num}.pdf"
            output_path = os.path.join(temp_dir, output_filename)
            
            with open(output_path, 'wb') as output_file:
                writer.write(output_file)
            
            output_files.append({
                'path': output_path,
                'filename': output_filename,
                'pages': f"{start_page_num}-{end_page_num}",
                'size': os.path.getsize(output_path)
            })
        
        return True, output_files, f"Split into {len(output_files)} files"
        
    except Exception as e:
        return False, [], f"Error splitting PDF: {str(e)}"

def parse_page_ranges(range_str, total_pages):
    """Parse page range string like '1-3,5-7,9' into list of tuples"""
    ranges = []
    
    for part in range_str.split(','):
        part = part.strip()
        if '-' in part:
            start, end = part.split('-', 1)
            start, end = int(start.strip()), int(end.strip())
        else:
            start = end = int(part)
        
        # Validate ranges
        start = max(1, start)
        end = min(total_pages, end)
        
        if start <= end:
            ranges.append((start, end))
    
    return ranges