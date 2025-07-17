import qrcode
import io
import base64
import hashlib
import secrets
import string
import uuid
import json
import logging
from flask import request
from PIL import Image
import barcode
from barcode.writer import ImageWriter

def process_qr_generator(request):
    """Process QR code generator tool"""
    try:
        text = request.form.get('text', '')
        size = int(request.form.get('size', 10))
        border = int(request.form.get('border', 4))
        fill_color = request.form.get('fill_color', 'black')
        back_color = request.form.get('back_color', 'white')
        
        if not text:
            return {'error': 'Text is required'}
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=size,
            border=border,
        )
        qr.add_data(text)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color=fill_color, back_color=back_color)
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            'success': True,
            'results': {
                'qr_code': f'data:image/png;base64,{img_base64}',
                'text': text,
                'size': size,
                'border': border,
                'fill_color': fill_color,
                'back_color': back_color
            }
        }
    
    except Exception as e:
        logging.error(f"QR generator error: {str(e)}")
        return {'error': 'Failed to generate QR code'}

def process_barcode_generator(request):
    """Process barcode generator tool"""
    try:
        text = request.form.get('text', '')
        barcode_type = request.form.get('barcode_type', 'code128')
        
        if not text:
            return {'error': 'Text is required'}
        
        # Create barcode
        barcode_class = barcode.get_barcode_class(barcode_type)
        barcode_instance = barcode_class(text, writer=ImageWriter())
        
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
