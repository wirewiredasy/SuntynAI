"""
PDF Compressor Tool - Reduce PDF file size
"""
import os
import tempfile
import fitz  # PyMuPDF
from werkzeug.utils import secure_filename

def compress_pdf(file, compression_level="medium"):
    """
    Compress PDF file to reduce size
    
    Args:
        file: PDF file object
        compression_level: "light", "medium", "heavy", "maximum"
    
    Returns:
        tuple: (success: bool, output_path: str, compression_info: dict, error: str)
    """
    try:
        # Create temporary directory
        temp_dir = tempfile.mkdtemp()
        
        # Save uploaded file temporarily
        input_path = os.path.join(temp_dir, secure_filename(file.filename))
        file.save(input_path)
        
        # Get original file size
        original_size = os.path.getsize(input_path)
        
        # Open PDF with PyMuPDF
        pdf_doc = fitz.open(input_path)
        
        # Compression settings based on level
        compression_settings = {
            "light": {
                "deflate": True,
                "deflate_images": True,
                "deflate_fonts": True,
                "garbage": 1,
                "clean": False,
                "sanitize": False
            },
            "medium": {
                "deflate": True,
                "deflate_images": True,
                "deflate_fonts": True,
                "garbage": 2,
                "clean": True,
                "sanitize": False
            },
            "heavy": {
                "deflate": True,
                "deflate_images": True,
                "deflate_fonts": True,
                "garbage": 3,
                "clean": True,
                "sanitize": True
            },
            "maximum": {
                "deflate": True,
                "deflate_images": True,
                "deflate_fonts": True,
                "garbage": 4,
                "clean": True,
                "sanitize": True
            }
        }
        
        settings = compression_settings.get(compression_level, compression_settings["medium"])
        
        # Create output path
        output_filename = f"compressed_{secure_filename(file.filename)}"
        output_path = os.path.join(temp_dir, output_filename)
        
        # Save with compression
        pdf_doc.save(
            output_path,
            deflate=settings["deflate"],
            deflate_images=settings["deflate_images"],
            deflate_fonts=settings["deflate_fonts"],
            garbage=settings["garbage"],
            clean=settings["clean"],
            sanitize=settings.get("sanitize", False)
        )
        
        pdf_doc.close()
        
        # Get compressed file size
        compressed_size = os.path.getsize(output_path)
        
        # Calculate compression ratio
        compression_ratio = round((1 - compressed_size / original_size) * 100, 1)
        
        compression_info = {
            'original_size': original_size,
            'compressed_size': compressed_size,
            'original_size_mb': round(original_size / (1024 * 1024), 2),
            'compressed_size_mb': round(compressed_size / (1024 * 1024), 2),
            'compression_ratio': compression_ratio,
            'level': compression_level
        }
        
        return True, output_path, compression_info, f"Compressed by {compression_ratio}%"
        
    except Exception as e:
        return False, None, {}, f"Error compressing PDF: {str(e)}"

def get_compression_preview(original_size, level):
    """Estimate compression results for preview"""
    estimates = {
        "light": 0.15,    # 15% reduction
        "medium": 0.35,   # 35% reduction  
        "heavy": 0.55,    # 55% reduction
        "maximum": 0.75   # 75% reduction
    }
    
    reduction = estimates.get(level, 0.35)
    estimated_size = int(original_size * (1 - reduction))
    
    return {
        'estimated_size': estimated_size,
        'estimated_size_mb': round(estimated_size / (1024 * 1024), 2),
        'estimated_reduction': round(reduction * 100, 1)
    }