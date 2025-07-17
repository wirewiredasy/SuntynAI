"""
Security utilities for file validation and malware scanning
"""

import os
import mimetypes
import hashlib
import logging
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)

# Allowed file extensions by category
ALLOWED_EXTENSIONS = {
    'image': {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'},
    'pdf': {'pdf'},
    'document': {'doc', 'docx', 'txt', 'rtf', 'odt'},
    'spreadsheet': {'xls', 'xlsx', 'csv', 'ods'},
    'presentation': {'ppt', 'pptx', 'odp'},
    'video': {'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'},
    'audio': {'mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a'},
    'archive': {'zip', 'rar', '7z', 'tar', 'gz'},
    'text': {'txt', 'json', 'xml', 'csv', 'html', 'css', 'js'}
}

# Maximum file sizes (in bytes)
MAX_FILE_SIZES = {
    'image': 16 * 1024 * 1024,    # 16MB
    'pdf': 32 * 1024 * 1024,      # 32MB
    'document': 16 * 1024 * 1024,  # 16MB
    'video': 100 * 1024 * 1024,    # 100MB
    'audio': 50 * 1024 * 1024,     # 50MB
    'default': 16 * 1024 * 1024    # 16MB
}

# Malicious file patterns
MALICIOUS_PATTERNS = [
    b'<script',
    b'javascript:',
    b'vbscript:',
    b'onload=',
    b'onerror=',
    b'<?php',
    b'<%',
    b'eval(',
    b'exec(',
    b'system(',
    b'shell_exec(',
    b'passthru(',
    b'base64_decode(',
    b'file_get_contents(',
    b'fopen(',
    b'fwrite(',
    b'include(',
    b'require(',
]

def validate_file_type(filename, allowed_categories):
    """
    Validate file type against allowed categories
    
    Args:
        filename: Name of the file
        allowed_categories: List of allowed categories or extensions
        
    Returns:
        bool: True if file is allowed, False otherwise
    """
    if not filename:
        return False
    
    # Get file extension
    extension = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    
    if not extension:
        return False
    
    # Check if extension is directly in allowed list
    if extension in allowed_categories:
        return True
    
    # Check if extension is in allowed categories
    for category in allowed_categories:
        if category in ALLOWED_EXTENSIONS:
            if extension in ALLOWED_EXTENSIONS[category]:
                return True
    
    return False

def validate_file_size(file_size, file_category='default'):
    """
    Validate file size against limits
    
    Args:
        file_size: Size of file in bytes
        file_category: Category of file (image, pdf, etc.)
        
    Returns:
        bool: True if size is acceptable, False otherwise
    """
    max_size = MAX_FILE_SIZES.get(file_category, MAX_FILE_SIZES['default'])
    return file_size <= max_size

def scan_for_malware(file_path):
    """
    Basic malware scanning using pattern matching
    
    Args:
        file_path: Path to file to scan
        
    Returns:
        bool: True if file appears safe, False if suspicious
    """
    try:
        with open(file_path, 'rb') as f:
            # Read first 1MB for scanning
            content = f.read(1024 * 1024)
            
            # Check for malicious patterns
            for pattern in MALICIOUS_PATTERNS:
                if pattern in content:
                    logger.warning(f"Malicious pattern found in {file_path}: {pattern}")
                    return False
        
        return True
        
    except Exception as e:
        logger.error(f"Error scanning file {file_path}: {str(e)}")
        return False

def calculate_file_hash(file_path, algorithm='sha256'):
    """
    Calculate hash of file for integrity checking
    
    Args:
        file_path: Path to file
        algorithm: Hash algorithm to use
        
    Returns:
        str: Hex digest of file hash
    """
    try:
        hash_func = hashlib.new(algorithm)
        
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_func.update(chunk)
        
        return hash_func.hexdigest()
        
    except Exception as e:
        logger.error(f"Error calculating hash for {file_path}: {str(e)}")
        return None

def sanitize_filename(filename):
    """
    Sanitize filename for safe storage
    
    Args:
        filename: Original filename
        
    Returns:
        str: Sanitized filename
    """
    # Use werkzeug's secure_filename
    safe_name = secure_filename(filename)
    
    # Additional sanitization
    safe_name = safe_name.replace(' ', '_')
    safe_name = ''.join(c for c in safe_name if c.isalnum() or c in '._-')
    
    # Ensure filename is not empty
    if not safe_name:
        safe_name = 'file'
    
    return safe_name

def validate_mime_type(file_path, allowed_types):
    """
    Validate file MIME type
    
    Args:
        file_path: Path to file
        allowed_types: List of allowed MIME types
        
    Returns:
        bool: True if MIME type is allowed
    """
    try:
        mime_type, _ = mimetypes.guess_type(file_path)
        return mime_type in allowed_types if mime_type else False
        
    except Exception as e:
        logger.error(f"Error checking MIME type for {file_path}: {str(e)}")
        return False

def is_safe_upload(file, allowed_categories):
    """
    Comprehensive file safety check
    
    Args:
        file: Uploaded file object
        allowed_categories: List of allowed file categories
        
    Returns:
        dict: Safety check results
    """
    result = {
        'safe': False,
        'errors': [],
        'warnings': []
    }
    
    # Check filename
    if not file.filename:
        result['errors'].append('No filename provided')
        return result
    
    # Validate file type
    if not validate_file_type(file.filename, allowed_categories):
        result['errors'].append('File type not allowed')
        return result
    
    # Check file size (if available)
    if hasattr(file, 'content_length') and file.content_length:
        file_category = get_file_category(file.filename)
        if not validate_file_size(file.content_length, file_category):
            result['errors'].append('File size too large')
            return result
    
    # If we get here, basic checks passed
    result['safe'] = True
    return result

def get_file_category(filename):
    """
    Determine file category from extension
    
    Args:
        filename: Name of file
        
    Returns:
        str: File category or 'unknown'
    """
    if not filename or '.' not in filename:
        return 'unknown'
    
    extension = filename.rsplit('.', 1)[-1].lower()
    
    for category, extensions in ALLOWED_EXTENSIONS.items():
        if extension in extensions:
            return category
    
    return 'unknown'