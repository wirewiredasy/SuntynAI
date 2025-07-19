"""
Image Toolkit Routes - 20 Professional Tools
"""
from flask import Blueprint, render_template, request, send_file, jsonify, flash, redirect, url_for
from werkzeug.utils import secure_filename
import os
from utils.image_tools import (
    resize_image, compress_image, convert_format, remove_background,
    crop_image, rotate_image, add_watermark, make_grayscale,
    blur_image, enhance_image, flip_image, invert_colors,
    add_border, get_metadata, images_to_pdf, pixelate_faces, create_meme
)

image_bp = Blueprint('image_tools', __name__)

# 1. Image Resizer
@image_bp.route('/image-resizer', methods=['GET', 'POST'])
def resize_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            width = int(request.form['width'])
            height = int(request.form['height'])
            maintain_aspect = 'maintain_aspect' in request.form
            
            result, ext = resize_image(file, width, height, maintain_aspect)
            return send_file(result, download_name=f'resized.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/resize.html')

# 2. Image Compressor
@image_bp.route('/image-compressor', methods=['GET', 'POST'])
def compress_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            quality = int(request.form.get('quality', 85))
            
            result, ext = compress_image(file, quality)
            return send_file(result, download_name=f'compressed.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/compress.html')

# 3. Convert to WebP
@image_bp.route('/convert-to-webp', methods=['GET', 'POST'])
def convert_webp_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            result, ext = convert_format(file, 'webp')
            return send_file(result, download_name=f'converted.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/convert_webp.html')

# 4. Convert to JPG
@image_bp.route('/convert-to-jpg', methods=['GET', 'POST'])
def convert_jpg_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            result, ext = convert_format(file, 'jpeg')
            return send_file(result, download_name=f'converted.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/convert_jpg.html')

# 5. Convert to PNG
@image_bp.route('/convert-to-png', methods=['GET', 'POST'])
def convert_png_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            result, ext = convert_format(file, 'png')
            return send_file(result, download_name=f'converted.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/convert_png.html')

# 6. Background Remover
@image_bp.route('/background-remover', methods=['GET', 'POST'])
def bg_remove_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            result, ext = remove_background(file)
            return send_file(result, download_name=f'no_bg.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/bg_remove.html')

# 7. Image Cropper
@image_bp.route('/image-cropper', methods=['GET', 'POST'])
def crop_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            x = int(request.form['x'])
            y = int(request.form['y'])
            width = int(request.form['width'])
            height = int(request.form['height'])
            
            result, ext = crop_image(file, x, y, width, height)
            return send_file(result, download_name=f'cropped.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/crop.html')

# 8. Image Rotator
@image_bp.route('/image-rotator', methods=['GET', 'POST'])
def rotate_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            angle = int(request.form['angle'])
            
            result, ext = rotate_image(file, angle)
            return send_file(result, download_name=f'rotated.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/rotate.html')

# 9. Add Watermark
@image_bp.route('/add-watermark', methods=['GET', 'POST'])
def watermark_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            text = request.form['watermark_text']
            position = request.form.get('position', 'bottom-right')
            opacity = int(request.form.get('opacity', 128))
            
            result, ext = add_watermark(file, text, position, opacity)
            return send_file(result, download_name=f'watermarked.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/watermark.html')

# 10. Grayscale Converter
@image_bp.route('/grayscale-converter', methods=['GET', 'POST'])
def grayscale_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            result, ext = make_grayscale(file)
            return send_file(result, download_name=f'grayscale.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/grayscale.html')

# 11. Image Blur
@image_bp.route('/image-blur', methods=['GET', 'POST'])
def blur_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            radius = int(request.form.get('radius', 2))
            
            result, ext = blur_image(file, radius)
            return send_file(result, download_name=f'blurred.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/blur.html')

# 12. Image Enhancer
@image_bp.route('/image-enhancer', methods=['GET', 'POST'])
def enhance_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            brightness = float(request.form.get('brightness', 1.0))
            contrast = float(request.form.get('contrast', 1.0))
            saturation = float(request.form.get('saturation', 1.0))
            sharpness = float(request.form.get('sharpness', 1.0))
            
            result, ext = enhance_image(file, brightness, contrast, saturation, sharpness)
            return send_file(result, download_name=f'enhanced.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/enhance.html')

# 13. Flip Image
@image_bp.route('/flip-image', methods=['GET', 'POST'])
def flip_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            direction = request.form.get('direction', 'horizontal')
            
            result, ext = flip_image(file, direction)
            return send_file(result, download_name=f'flipped.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/flip.html')

# 14. Invert Colors
@image_bp.route('/invert-colors', methods=['GET', 'POST'])
def invert_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            result, ext = invert_colors(file)
            return send_file(result, download_name=f'inverted.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/invert.html')

# 15. Add Border
@image_bp.route('/add-border', methods=['GET', 'POST'])
def border_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            border_width = int(request.form.get('border_width', 10))
            border_color = request.form.get('border_color', 'white')
            
            result, ext = add_border(file, border_width, border_color)
            return send_file(result, download_name=f'bordered.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/border.html')

# 16. Image Metadata Viewer
@image_bp.route('/image-metadata', methods=['GET', 'POST'])
def metadata_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            metadata = get_metadata(file)
            return render_template('image_tools/metadata.html', metadata=metadata, show_result=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/metadata.html')

# 17. Images to PDF
@image_bp.route('/images-to-pdf', methods=['GET', 'POST'])
def images_pdf_tool():
    if request.method == 'POST':
        try:
            files = request.files.getlist('images')
            if not files:
                flash('Please select images', 'error')
                return render_template('image_tools/images_to_pdf.html')
            
            result, ext = images_to_pdf(files)
            return send_file(result, download_name=f'images.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/images_to_pdf.html')

# 18. Face Pixelator
@image_bp.route('/face-pixelator', methods=['GET', 'POST'])
def pixelate_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            result, ext = pixelate_faces(file)
            return send_file(result, download_name=f'pixelated.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/pixelate.html')

# 19. Meme Generator
@image_bp.route('/meme-generator', methods=['GET', 'POST'])
def meme_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            top_text = request.form.get('top_text', '')
            bottom_text = request.form.get('bottom_text', '')
            
            result, ext = create_meme(file, top_text, bottom_text)
            return send_file(result, download_name=f'meme.{ext}', as_attachment=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/meme.html')

# 20. Color Palette Extractor
@image_bp.route('/color-palette', methods=['GET', 'POST'])
def palette_tool():
    if request.method == 'POST':
        try:
            file = request.files['image']
            from PIL import Image
            import numpy as np
            from sklearn.cluster import KMeans
            
            img = Image.open(file).convert('RGB')
            img_array = np.array(img)
            pixels = img_array.reshape(-1, 3)
            
            # Extract dominant colors using k-means
            kmeans = KMeans(n_clusters=8, random_state=42)
            kmeans.fit(pixels)
            colors = kmeans.cluster_centers_.astype(int)
            
            # Convert to hex
            hex_colors = ['#%02x%02x%02x' % tuple(color) for color in colors]
            
            return render_template('image_tools/palette.html', colors=hex_colors, show_result=True)
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
    
    return render_template('image_tools/palette.html')