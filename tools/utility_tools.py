import qrcode
import io
import base64
import hashlib
import secrets
import string
import uuid
import json
import logging
import tempfile
import os
from flask import request
from PIL import Image
try:
    import barcode
    from barcode.writer import ImageWriter
    BARCODE_AVAILABLE = True
except ImportError:
    BARCODE_AVAILABLE = False
    logging.warning("Barcode library not available")

def process_qr_generator(request):
    """Process QR code generator tool"""
    try:
        content = request.form.get('content', '')
        qr_type = request.form.get('type', 'text')
        size = int(request.form.get('size', 200))
        color = request.form.get('color', '#000000')
        bg_color = request.form.get('bg_color', '#ffffff')
        output_format = request.form.get('format', 'PNG')
        
        if not content:
            return {'error': 'Content is required'}
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=size // 25,  # Scale box size based on total size
            border=4,
        )
        qr.add_data(content)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color=color, back_color=bg_color)
        
        # Resize to exact dimensions
        img = img.resize((size, size), Image.Resampling.NEAREST)
        
        # Create base64 for preview and save file
        buffer = io.BytesIO()
        img.save(buffer, format=output_format)
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        # Save file to uploads directory
        output_filename = f'qr_code_{uuid.uuid4().hex[:8]}.{output_format.lower()}'
        uploads_dir = os.path.join(os.getcwd(), 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        final_path = os.path.join(uploads_dir, output_filename)
        
        img.save(final_path, format=output_format)
        
        return {
            'success': True,
            'message': 'QR code generated successfully',
            'qr_image': f'data:image/{output_format.lower()};base64,{img_base64}',
            'download_url': f'/uploads/{output_filename}',
            'output_file': final_path
        }
    
    except Exception as e:
        logging.error(f"QR generator error: {str(e)}")
        return {'error': 'Failed to generate QR code'}

def process_barcode_generator(request):
    """Process barcode generator tool"""
    try:
        if not BARCODE_AVAILABLE:
            return {'error': 'Barcode generation not available, please install python-barcode'}
            
        text = request.form.get('text', '')
        barcode_type = request.form.get('barcode_type', 'code128')
        
        if not text:
            return {'error': 'Text is required'}
        
        # Create barcode
        try:
            barcode_class = barcode.get_barcode_class(barcode_type)
            barcode_instance = barcode_class(text, writer=ImageWriter())
        except Exception as e:
            return {'error': f'Invalid barcode type or data: {str(e)}'}
        
        # Generate barcode image
        buffer = io.BytesIO()
        barcode_instance.write(buffer)
        buffer.seek(0)
        
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            'success': True,
            'results': {
                'barcode': f'data:image/png;base64,{img_base64}',
                'text': text,
                'type': barcode_type
            }
        }
    
    except Exception as e:
        logging.error(f"Barcode generator error: {str(e)}")
        return {'error': 'Failed to generate barcode'}

def process_password_generator(request):
    """Process password generator tool"""
    try:
        length = int(request.form.get('length', 12))
        include_uppercase = request.form.get('include_uppercase', 'true') == 'true'
        include_lowercase = request.form.get('include_lowercase', 'true') == 'true'
        include_numbers = request.form.get('include_numbers', 'true') == 'true'
        include_symbols = request.form.get('include_symbols', 'true') == 'true'
        exclude_ambiguous = request.form.get('exclude_ambiguous', 'false') == 'true'
        
        if length < 1 or length > 128:
            return {'error': 'Length must be between 1 and 128'}
        
        characters = ''
        
        if include_lowercase:
            chars = string.ascii_lowercase
            if exclude_ambiguous:
                chars = chars.replace('l', '').replace('o', '')
            characters += chars
        
        if include_uppercase:
            chars = string.ascii_uppercase
            if exclude_ambiguous:
                chars = chars.replace('I', '').replace('O', '')
            characters += chars
        
        if include_numbers:
            chars = string.digits
            if exclude_ambiguous:
                chars = chars.replace('0', '').replace('1', '')
            characters += chars
        
        if include_symbols:
            chars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
            characters += chars
        
        if not characters:
            return {'error': 'At least one character type must be selected'}
        
        # Generate password
        password = ''.join(secrets.choice(characters) for _ in range(length))
        
        # Calculate strength
        strength = calculate_password_strength(password)
        
        return {
            'success': True,
            'results': {
                'password': password,
                'length': length,
                'strength': strength,
                'settings': {
                    'uppercase': include_uppercase,
                    'lowercase': include_lowercase,
                    'numbers': include_numbers,
                    'symbols': include_symbols,
                    'exclude_ambiguous': exclude_ambiguous
                }
            }
        }
    
    except Exception as e:
        logging.error(f"Password generator error: {str(e)}")
        return {'error': 'Failed to generate password'}

def calculate_password_strength(password):
    """Calculate password strength"""
    score = 0
    
    # Length bonus
    score += min(len(password) * 2, 50)
    
    # Character variety
    if any(c.islower() for c in password):
        score += 10
    if any(c.isupper() for c in password):
        score += 10
    if any(c.isdigit() for c in password):
        score += 10
    if any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
        score += 20
    
    # Penalty for common patterns
    if password.lower() in ['password', '123456', 'qwerty', 'admin']:
        score -= 50
    
    # Determine strength level
    if score >= 80:
        return 'Very Strong'
    elif score >= 60:
        return 'Strong'
    elif score >= 40:
        return 'Medium'
    elif score >= 20:
        return 'Weak'
    else:
        return 'Very Weak'

def process_hash_generator(request):
    """Process hash generator tool"""
    try:
        text = request.form.get('text', '')
        hash_type = request.form.get('hash_type', 'md5')
        
        if not text:
            return {'error': 'Text is required'}
        
        text_bytes = text.encode('utf-8')
        
        if hash_type == 'md5':
            hash_obj = hashlib.md5(text_bytes)
        elif hash_type == 'sha1':
            hash_obj = hashlib.sha1(text_bytes)
        elif hash_type == 'sha256':
            hash_obj = hashlib.sha256(text_bytes)
        elif hash_type == 'sha512':
            hash_obj = hashlib.sha512(text_bytes)
        else:
            return {'error': 'Invalid hash type'}
        
        hash_value = hash_obj.hexdigest()
        
        return {
            'success': True,
            'results': {
                'original_text': text,
                'hash_type': hash_type,
                'hash_value': hash_value,
                'length': len(hash_value)
            }
        }
    
    except Exception as e:
        logging.error(f"Hash generator error: {str(e)}")
        return {'error': 'Failed to generate hash'}

def process_uuid_generator(request):
    """Process UUID generator tool"""
    try:
        uuid_version = int(request.form.get('version', 4))
        count = int(request.form.get('count', 1))
        
        if count < 1 or count > 100:
            return {'error': 'Count must be between 1 and 100'}
        
        uuids = []
        
        for _ in range(count):
            if uuid_version == 1:
                new_uuid = str(uuid.uuid1())
            elif uuid_version == 4:
                new_uuid = str(uuid.uuid4())
            else:
                return {'error': 'Only UUID version 1 and 4 are supported'}
            
            uuids.append(new_uuid)
        
        return {
            'success': True,
            'results': {
                'uuids': uuids,
                'version': uuid_version,
                'count': count
            }
        }
    
    except Exception as e:
        logging.error(f"UUID generator error: {str(e)}")
        return {'error': 'Failed to generate UUID'}

def process_url_shortener(request):
    """Process URL shortener tool"""
    try:
        long_url = request.form.get('long_url', '').strip()
        custom_path = request.form.get('custom_path', '').strip()
        
        if not long_url:
            return {'error': 'URL is required'}
        
        # Add protocol if missing
        if not long_url.startswith(('http://', 'https://')):
            long_url = 'https://' + long_url
        
        # Validate URL
        try:
            from urllib.parse import urlparse
            parsed = urlparse(long_url)
            if not parsed.netloc:
                return {'error': 'Invalid URL format'}
        except Exception:
            return {'error': 'Invalid URL format'}
        
        # Generate short path
        if custom_path:
            # Validate custom path
            import re
            if not re.match(r'^[a-zA-Z0-9-_]+$', custom_path):
                return {'error': 'Custom path can only contain letters, numbers, hyphens, and underscores'}
            short_path = custom_path
        else:
            # Generate random path
            import string
            import secrets
            chars = string.ascii_letters + string.digits
            short_path = ''.join(secrets.choice(chars) for _ in range(6))
        
        short_url = f'https://suntyn.ai/{short_path}'
        
        return {
            'success': True,
            'results': {
                'short_url': short_url,
                'original_url': long_url,
                'short_path': short_path,
                'clicks': 0,
                'created_at': uuid.uuid4().hex[:8]
            }
        }
    
    except Exception as e:
        logging.error(f"URL shortener error: {str(e)}")
        return {'error': 'Failed to shorten URL'}

def process_json_formatter(request):
    """Process JSON formatter tool"""
    try:
        json_text = request.form.get('json_text', '')
        action = request.form.get('action', 'format')  # 'format' or 'minify'
        
        if not json_text:
            return {'error': 'JSON text is required'}
        
        # Parse JSON
        try:
            parsed_json = json.loads(json_text)
        except json.JSONDecodeError as e:
            return {'error': f'Invalid JSON: {str(e)}'}
        
        if action == 'format':
            formatted_json = json.dumps(parsed_json, indent=2, sort_keys=True)
        else:  # minify
            formatted_json = json.dumps(parsed_json, separators=(',', ':'))
        
        return {
            'success': True,
            'results': {
                'original': json_text,
                'formatted': formatted_json,
                'action': action,
                'valid': True
            }
        }
    
    except Exception as e:
        logging.error(f"JSON formatter error: {str(e)}")
        return {'error': 'Failed to format JSON'}
