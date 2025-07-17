import os
import shutil
import tempfile
from werkzeug.utils import secure_filename
from flask import current_app
import logging

def ensure_upload_directory():
    """Ensure upload directory exists"""
    upload_dir = os.path.join(current_app.root_path, 'uploads')
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    return upload_dir

def save_uploaded_file(file_path, filename):
    """Save uploaded file to uploads directory"""
    try:
        upload_dir = ensure_upload_directory()
        safe_filename = secure_filename(filename)
        
        # Add timestamp to avoid conflicts
        import time
        timestamp = int(time.time())
        name, ext = os.path.splitext(safe_filename)
        final_filename = f"{name}_{timestamp}{ext}"
        
        final_path = os.path.join(upload_dir, final_filename)
        shutil.copy2(file_path, final_path)
        
        return final_filename
    
    except Exception as e:
        logging.error(f"Error saving file: {str(e)}")
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
        logging.error(f"Error deleting file: {str(e)}")
        return False

def get_file_size(file_path):
    """Get file size in bytes"""
    try:
        return os.path.getsize(file_path)
    except:
        return 0

def get_file_extension(filename):
    """Get file extension"""
    return os.path.splitext(filename)[1].lower().lstrip('.')

def is_allowed_file(filename, allowed_extensions):
    """Check if file extension is allowed"""
    return '.' in filename and get_file_extension(filename) in allowed_extensions

def create_temp_file(suffix=''):
    """Create temporary file"""
    return tempfile.NamedTemporaryFile(delete=False, suffix=suffix)

def cleanup_temp_files(file_paths):
    """Clean up temporary files"""
    for file_path in file_paths:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except:
            pass

def compress_file(file_path, compression_level=6):
    """Compress file using gzip"""
    import gzip
    
    try:
        with open(file_path, 'rb') as f_in:
            with gzip.open(f'{file_path}.gz', 'wb', compresslevel=compression_level) as f_out:
                shutil.copyfileobj(f_in, f_out)
        return f'{file_path}.gz'
    except Exception as e:
        logging.error(f"Error compressing file: {str(e)}")
        return None

def get_mime_type(filename):
    """Get MIME type of file"""
    import mimetypes
    return mimetypes.guess_type(filename)[0] or 'application/octet-stream'

def validate_file_size(file, max_size_mb=16):
    """Validate file size"""
    max_size_bytes = max_size_mb * 1024 * 1024
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    return size <= max_size_bytes

def generate_unique_filename(original_filename):
    """Generate unique filename"""
    import uuid
    name, ext = os.path.splitext(secure_filename(original_filename))
    unique_id = str(uuid.uuid4())[:8]
    return f"{name}_{unique_id}{ext}"
