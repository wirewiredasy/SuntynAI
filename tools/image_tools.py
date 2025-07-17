import os
import tempfile
from flask import request
from werkzeug.utils import secure_filename
from PIL import Image, ImageFilter, ImageEnhance
import logging
from utils.file_handler import save_uploaded_file
from utils.security import validate_file_type

def process_image_compressor(request):
    """Process image compressor tool"""
    try:
        if 'file' not in request.files:
            return {'error': 'No file provided'}
        
        file = request.files['file']
        if not validate_file_type(file.filename, ['jpg', 'jpeg', 'png', 'bmp', 'webp']):
            return {'error': 'Invalid file type'}
        
        quality = int(request.form.get('quality', 85))
        output_format = request.form.get('output_format', 'original')
        max_width = request.form.get('max_width')
        max_height = request.form.get('max_height')
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded file
            filename = secure_filename(file.filename)
            filepath = os.path.join(temp_dir, filename)
            file.save(filepath)
            
            # Get original file size
            original_size = os.path.getsize(filepath)
            
            # Open and process image
            with Image.open(filepath) as img:
                # Resize if dimensions specified
                if max_width or max_height:
                    max_width = int(max_width) if max_width else img.width
                    max_height = int(max_height) if max_height else img.height
                    img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
                
                # Determine output format
                if output_format == 'original':
                    format_type = img.format or 'JPEG'
                else:
                    format_type = output_format
                
                # Convert to RGB if saving as JPEG
                if format_type == 'JPEG' and img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Create output filename
                base_name = os.path.splitext(filename)[0]
                extension = '.jpg' if format_type == 'JPEG' else '.png' if format_type == 'PNG' else '.webp'
                output_filename = f'compressed_{base_name}{extension}'
                output_path = os.path.join(temp_dir, output_filename)
                
                # Save compressed image
                save_kwargs = {'format': format_type, 'optimize': True}
                if format_type in ['JPEG', 'WEBP']:
                    save_kwargs['quality'] = quality
                
                img.save(output_path, **save_kwargs)
                
                # Get compressed file size
                compressed_size = os.path.getsize(output_path)
                compression_ratio = ((original_size - compressed_size) / original_size) * 100
                
                # Save to uploads directory
                final_path = save_uploaded_file(output_path, output_filename)
                
                return {
                    'success': True,
                    'message': 'Image compressed successfully',
                    'output_file': final_path,
                    'original_size': original_size,
                    'compressed_size': compressed_size,
                    'compression_ratio': round(compression_ratio, 2),
                    'download_url': f'/uploads/{output_filename}'
                }
    
    except Exception as e:
        logging.error(f"Image compressor error: {str(e)}")
        return {'error': 'Failed to compress image'}

def process_image_resizer(request):
    """Process image resizer tool"""
    try:
        if 'file' not in request.files:
            return {'error': 'No file provided'}
        
        file = request.files['file']
        if not validate_file_type(file.filename, ['jpg', 'jpeg', 'png', 'bmp', 'webp']):
            return {'error': 'Invalid file type'}
        
        width = int(request.form.get('width', 0))
        height = int(request.form.get('height', 0))
        maintain_aspect = request.form.get('maintain_aspect', 'true') == 'true'
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded file
            filename = secure_filename(file.filename)
            filepath = os.path.join(temp_dir, filename)
            file.save(filepath)
            
            # Open and resize image
            with Image.open(filepath) as img:
                original_width, original_height = img.size
                
                # Calculate new dimensions
                if maintain_aspect:
                    if width and height:
                        ratio = min(width / original_width, height / original_height)
                        new_width = int(original_width * ratio)
                        new_height = int(original_height * ratio)
                    elif width:
                        ratio = width / original_width
                        new_width = width
                        new_height = int(original_height * ratio)
                    elif height:
                        ratio = height / original_height
                        new_width = int(original_width * ratio)
                        new_height = height
                    else:
                        return {'error': 'Please provide width or height'}
                else:
                    new_width = width or original_width
                    new_height = height or original_height
                
                # Resize image
                resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                # Create output filename
                base_name = os.path.splitext(filename)[0]
                extension = os.path.splitext(filename)[1]
                output_filename = f'resized_{base_name}_{new_width}x{new_height}{extension}'
                output_path = os.path.join(temp_dir, output_filename)
                
                # Save resized image
                resized_img.save(output_path, quality=90, optimize=True)
                
                # Save to uploads directory
                final_path = save_uploaded_file(output_path, output_filename)
                
                return {
                    'success': True,
                    'message': 'Image resized successfully',
                    'output_file': final_path,
                    'original_dimensions': f'{original_width}x{original_height}',
                    'new_dimensions': f'{new_width}x{new_height}',
                    'download_url': f'/uploads/{output_filename}'
                }
    
    except Exception as e:
        logging.error(f"Image resizer error: {str(e)}")
        return {'error': 'Failed to resize image'}

def process_background_remover(request):
    """Process background remover tool"""
    try:
        if 'file' not in request.files:
            return {'error': 'No file provided'}
        
        file = request.files['file']
        if not validate_file_type(file.filename, ['jpg', 'jpeg', 'png', 'bmp']):
            return {'error': 'Invalid file type'}
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded file
            filename = secure_filename(file.filename)
            filepath = os.path.join(temp_dir, filename)
            file.save(filepath)
            
            # Open image
            with Image.open(filepath) as img:
                # Convert to RGBA if not already
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                
                # Simple background removal (placeholder - would need advanced AI)
                # This is a basic implementation - in production you'd use AI models
                data = img.getdata()
                new_data = []
                
                # Get the color of the first pixel (assuming it's background)
                bg_color = data[0][:3]  # RGB only
                
                for item in data:
                    # If pixel is similar to background color, make it transparent
                    if abs(item[0] - bg_color[0]) < 30 and \
                       abs(item[1] - bg_color[1]) < 30 and \
                       abs(item[2] - bg_color[2]) < 30:
                        new_data.append((255, 255, 255, 0))  # Transparent
                    else:
                        new_data.append(item)
                
                img.putdata(new_data)
                
                # Create output filename
                base_name = os.path.splitext(filename)[0]
                output_filename = f'no_bg_{base_name}.png'
                output_path = os.path.join(temp_dir, output_filename)
                
                # Save image with transparent background
                img.save(output_path, 'PNG')
                
                # Save to uploads directory
                final_path = save_uploaded_file(output_path, output_filename)
                
                return {
                    'success': True,
                    'message': 'Background removed successfully',
                    'output_file': final_path,
                    'download_url': f'/uploads/{output_filename}'
                }
    
    except Exception as e:
        logging.error(f"Background remover error: {str(e)}")
        return {'error': 'Failed to remove background'}
