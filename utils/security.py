import os
import hashlib
import hmac
import secrets
from flask import current_app
import logging

def validate_file_type(filename, allowed_extensions):
    """Validate file type against allowed extensions"""
    if not filename:
        return False
    
    extension = filename.lower().split('.')[-1] if '.' in filename else ''
    return extension in allowed_extensions

def scan_file_for_malware(file_path):
    """Basic file scanning for malware indicators"""
    try:
        # Check file size (basic protection)
        max_size = 100 * 1024 * 1024  # 100MB
        if os.path.getsize(file_path) > max_size:
            return False
        
        # Check for suspicious patterns in filename
        filename = os.path.basename(file_path).lower()
        suspicious_patterns = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js', '.jar']
        
        for pattern in suspicious_patterns:
            if pattern in filename:
                return False
        
        # Basic content scanning for PDFs
        if filename.endswith('.pdf'):
            return scan_pdf_content(file_path)
        
        return True
    
    except Exception as e:
        logging.error(f"Error scanning file: {str(e)}")
        return False

def scan_pdf_content(file_path):
    """Scan PDF content for malicious patterns"""
    try:
        with open(file_path, 'rb') as file:
            content = file.read(1024)  # Read first 1KB
            
            # Check for suspicious PDF patterns
            suspicious_patterns = [
                b'/JavaScript',
                b'/JS',
                b'/OpenAction',
                b'/Launch',
                b'/EmbeddedFile'
            ]
            
            for pattern in suspicious_patterns:
                if pattern in content:
                    logging.warning(f"Suspicious pattern found in PDF: {pattern}")
                    return False
        
        return True
    
    except Exception as e:
        logging.error(f"Error scanning PDF: {str(e)}")
        return False

def generate_csrf_token():
    """Generate CSRF token"""
    return secrets.token_hex(16)

def validate_csrf_token(token, expected_token):
    """Validate CSRF token"""
    return hmac.compare_digest(token, expected_token)

def hash_password(password):
    """Hash password using bcrypt"""
    import bcrypt
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed_password):
    """Verify password against hash"""
    import bcrypt
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def sanitize_filename(filename):
    """Sanitize filename for security"""
    import re
    
    # Remove path components
    filename = os.path.basename(filename)
    
    # Remove or replace dangerous characters
    filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    
    # Limit length
    if len(filename) > 255:
        name, ext = os.path.splitext(filename)
        filename = name[:255-len(ext)] + ext
    
    return filename

def validate_input_length(input_str, max_length=1000):
    """Validate input string length"""
    return len(input_str) <= max_length

def sanitize_html(html_string):
    """Sanitize HTML to prevent XSS"""
    import html
    return html.escape(html_string)

def validate_url(url):
    """Validate URL format"""
    import re
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return url_pattern.match(url) is not None

def rate_limit_key(user_id, endpoint):
    """Generate rate limit key"""
    return f"rate_limit:{user_id}:{endpoint}"

def check_rate_limit(user_id, endpoint, max_requests=100, window_seconds=3600):
    """Check rate limit for user endpoint"""
    # This would typically use Redis or similar
    # For now, return True (no rate limiting)
    return True

def log_security_event(event_type, user_id, details):
    """Log security events"""
    logging.warning(f"Security Event: {event_type} - User: {user_id} - Details: {details}")

def validate_json_input(json_str):
    """Validate JSON input"""
    import json
    try:
        data = json.loads(json_str)
        # Check for reasonable size
        if len(json_str) > 1024 * 1024:  # 1MB limit
            return False, "JSON too large"
        return True, data
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {str(e)}"

def encrypt_sensitive_data(data, key=None):
    """Encrypt sensitive data"""
    from cryptography.fernet import Fernet
    
    if key is None:
        key = os.environ.get('ENCRYPTION_KEY')
        if not key:
            key = Fernet.generate_key()
    
    f = Fernet(key)
    return f.encrypt(data.encode()).decode()

def decrypt_sensitive_data(encrypted_data, key=None):
    """Decrypt sensitive data"""
    from cryptography.fernet import Fernet
    
    if key is None:
        key = os.environ.get('ENCRYPTION_KEY')
        if not key:
            raise ValueError("Encryption key not found")
    
    f = Fernet(key)
    return f.decrypt(encrypted_data.encode()).decode()
