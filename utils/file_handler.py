"""
File handling utilities for Suntyn AI platform
"""

import os
import shutil
import tempfile
from werkzeug.utils import secure_filename
from flask import current_app
import logging

logger = logging.getLogger(__name__)

def ensure_upload_directory():
    """Ensure uploads directory exists"""
    upload_dir = os.path.join(current_app.root_path, 'uploads')
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    return upload_dir

def save_uploaded_file(source_path, filename):
    """Save a file to the uploads directory"""
    try:
        upload_dir = ensure_upload_directory()
        safe_filename = secure_filename(filename)
        
        # Add timestamp to avoid conflicts
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        safe_filename = f"{timestamp}{safe_filename}"
        
        destination_path = os.path.join(upload_dir, safe_filename)
        shutil.copy2(source_path, destination_path)
        
        return destination_path
        
    except Exception as e:
        logger.error(f"Error saving file {filename}: {str(e)}")
        raise

def get_file_path(filename):
    """Get full path to uploaded file"""
    upload_dir = ensure_upload_directory()
    return os.path.join(upload_dir, filename)

def delete_file(filename):
    """Delete uploaded file"""
    try:
        file_path = get_file_path(filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception as e:
        logger.error(f"Error deleting file {filename}: {str(e)}")
        return False

def get_file_size(file_path):
    """Get file size in bytes"""
    try:
        return os.path.getsize(file_path)
    except:
        return 0

def format_file_size(bytes_size):
    """Format file size in human readable format"""
    if bytes_size == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    size_index = 0
    
    while bytes_size >= 1024 and size_index < len(size_names) - 1:
        bytes_size /= 1024.0
        size_index += 1
    
    return f"{bytes_size:.1f} {size_names[size_index]}"

def cleanup_temp_files():
    """Clean up temporary files older than 1 hour"""
    try:
        temp_dir = tempfile.gettempdir()
        current_time = time.time()
        
        for filename in os.listdir(temp_dir):
            file_path = os.path.join(temp_dir, filename)
            if os.path.isfile(file_path):
                file_age = current_time - os.path.getctime(file_path)
                if file_age > 3600:  # 1 hour
                    try:
                        os.remove(file_path)
                    except:
                        pass
    except Exception as e:
        logger.error(f"Error cleaning temp files: {str(e)}")