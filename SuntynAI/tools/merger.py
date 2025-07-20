"""
PDF Merger Tool - Combines multiple PDFs into one
"""
import os
import tempfile
from PyPDF2 import PdfMerger, PdfReader
from werkzeug.utils import secure_filename

def merge_pdfs(files, output_filename="merged.pdf"):
    """
    Merge multiple PDF files into one
    
    Args:
        files: List of file objects
        output_filename: Name of output file
    
    Returns:
        tuple: (success: bool, output_path: str, error: str)
    """
    try:
        merger = PdfMerger()
        temp_files = []
        
        # Create temporary directory
        temp_dir = tempfile.mkdtemp()
        
        for file in files:
            if file.filename.endswith('.pdf'):
                # Save uploaded file temporarily
                temp_path = os.path.join(temp_dir, secure_filename(file.filename))
                file.save(temp_path)
                temp_files.append(temp_path)
                
                # Add to merger
                merger.append(temp_path)
        
        if not temp_files:
            return False, None, "No valid PDF files provided"
        
        # Output path
        output_path = os.path.join(temp_dir, output_filename)
        
        # Write merged PDF
        with open(output_path, 'wb') as output_file:
            merger.write(output_file)
        
        merger.close()
        
        # Get file size for stats
        file_size = os.path.getsize(output_path)
        file_size_mb = round(file_size / (1024 * 1024), 2)
        
        return True, output_path, f"Successfully merged {len(temp_files)} files. Size: {file_size_mb}MB"
        
    except Exception as e:
        return False, None, f"Error merging PDFs: {str(e)}"

def get_pdf_info(file_path):
    """Get basic PDF information"""
    try:
        reader = PdfReader(file_path)
        return {
            'pages': len(reader.pages),
            'size': os.path.getsize(file_path),
            'encrypted': reader.is_encrypted
        }
    except:
        return {'pages': 0, 'size': 0, 'encrypted': False}