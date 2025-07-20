"""
Image processing utilities for the Image Toolkit
"""
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
import io
import os

# Optional dependencies with graceful fallbacks
try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

# Other optional dependencies
try:
    from rembg import remove
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False

try:
    import piexif
    PIEXIF_AVAILABLE = True
except ImportError:
    PIEXIF_AVAILABLE = False

def resize_image(file, width, height, maintain_aspect=False):
    """Resize image to specified dimensions"""
    img = Image.open(file)
    
    if maintain_aspect:
        img.thumbnail((width, height), Image.Resampling.LANCZOS)
    else:
        img = img.resize((width, height), Image.Resampling.LANCZOS)
    
    output = io.BytesIO()
    format = img.format or 'PNG'
    img.save(output, format=format, quality=95)
    output.seek(0)
    return output, format.lower()

def compress_image(file, quality=85):
    """Compress image with specified quality"""
    img = Image.open(file)
    
    # Convert to RGB if necessary
    if img.mode in ('RGBA', 'LA', 'P'):
        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        rgb_img.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
        img = rgb_img
    
    output = io.BytesIO()
    img.save(output, format='JPEG', quality=quality, optimize=True)
    output.seek(0)
    return output, 'jpeg'

def convert_format(file, target_format):
    """Convert image to target format"""
    img = Image.open(file)
    
    if target_format.upper() == 'JPEG' and img.mode in ('RGBA', 'LA', 'P'):
        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        rgb_img.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
        img = rgb_img
    
    output = io.BytesIO()
    img.save(output, format=target_format.upper(), quality=95)
    output.seek(0)
    return output, target_format.lower()

def remove_background(file):
    """Remove background from image"""
    try:
        from rembg import remove
        input_data = file.read()
        output_data = remove(input_data)
        
        output = io.BytesIO(output_data)
        output.seek(0)
        return output, 'png'
    except ImportError:
        # Fallback: return original image if rembg not available
        file.seek(0)
        img = Image.open(file)
        output = io.BytesIO()
        img.save(output, format='PNG')
        output.seek(0)
        return output, 'png'

def crop_image(file, x, y, width, height):
    """Crop image to specified rectangle"""
    img = Image.open(file)
    cropped = img.crop((x, y, x + width, y + height))
    
    output = io.BytesIO()
    format = img.format or 'PNG'
    cropped.save(output, format=format)
    output.seek(0)
    return output, format.lower()

def rotate_image(file, angle):
    """Rotate image by specified angle"""
    img = Image.open(file)
    rotated = img.rotate(angle, expand=True, fillcolor=(255, 255, 255))
    
    output = io.BytesIO()
    format = img.format or 'PNG'
    rotated.save(output, format=format)
    output.seek(0)
    return output, format.lower()

def add_watermark(file, watermark_text, position='bottom-right', opacity=128):
    """Add text watermark to image"""
    img = Image.open(file)
    
    # Create a transparent overlay
    overlay = Image.new('RGBA', img.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Try to load a font
    try:
        font = ImageFont.truetype('arial.ttf', 36)
    except:
        font = ImageFont.load_default()
    
    # Calculate text position
    text_bbox = draw.textbbox((0, 0), watermark_text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    if position == 'bottom-right':
        x = img.width - text_width - 20
        y = img.height - text_height - 20
    elif position == 'top-left':
        x, y = 20, 20
    elif position == 'center':
        x = (img.width - text_width) // 2
        y = (img.height - text_height) // 2
    else:
        x, y = 20, 20
    
    # Draw watermark
    draw.text((x, y), watermark_text, fill=(255, 255, 255, opacity), font=font)
    
    # Composite the overlay
    watermarked = Image.alpha_composite(img.convert('RGBA'), overlay)
    
    output = io.BytesIO()
    watermarked.convert('RGB').save(output, format='PNG')
    output.seek(0)
    return output, 'png'

def make_grayscale(file):
    """Convert image to grayscale"""
    img = Image.open(file)
    grayscale = img.convert('L')
    
    output = io.BytesIO()
    grayscale.save(output, format='PNG')
    output.seek(0)
    return output, 'png'

def blur_image(file, radius=2):
    """Apply blur effect to image"""
    img = Image.open(file)
    blurred = img.filter(ImageFilter.GaussianBlur(radius=radius))
    
    output = io.BytesIO()
    format = img.format or 'PNG'
    blurred.save(output, format=format)
    output.seek(0)
    return output, format.lower()

def enhance_image(file, brightness=1.0, contrast=1.0, saturation=1.0, sharpness=1.0):
    """Enhance image with various adjustments"""
    img = Image.open(file)
    
    # Apply enhancements
    if brightness != 1.0:
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(brightness)
    
    if contrast != 1.0:
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(contrast)
    
    if saturation != 1.0:
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(saturation)
    
    if sharpness != 1.0:
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(sharpness)
    
    output = io.BytesIO()
    format = img.format or 'PNG'
    img.save(output, format=format)
    output.seek(0)
    return output, format.lower()

def flip_image(file, direction='horizontal'):
    """Flip image horizontally or vertically"""
    img = Image.open(file)
    
    if direction == 'horizontal':
        flipped = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    else:  # vertical
        flipped = img.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    
    output = io.BytesIO()
    format = img.format or 'PNG'
    flipped.save(output, format=format)
    output.seek(0)
    return output, format.lower()

def invert_colors(file):
    """Invert image colors"""
    img = Image.open(file)
    
    if img.mode == 'RGBA':
        # Split channels and invert RGB, keep alpha
        r, g, b, a = img.split()
        r = Image.eval(r, lambda x: 255 - x)
        g = Image.eval(g, lambda x: 255 - x)
        b = Image.eval(b, lambda x: 255 - x)
        inverted = Image.merge('RGBA', (r, g, b, a))
    else:
        inverted = Image.eval(img.convert('RGB'), lambda x: 255 - x)
    
    output = io.BytesIO()
    inverted.save(output, format='PNG')
    output.seek(0)
    return output, 'png'

def add_border(file, border_width=10, border_color='white'):
    """Add border to image"""
    img = Image.open(file)
    
    # Create new image with border
    new_width = img.width + (border_width * 2)
    new_height = img.height + (border_width * 2)
    
    bordered = Image.new('RGB', (new_width, new_height), border_color)
    bordered.paste(img, (border_width, border_width))
    
    output = io.BytesIO()
    bordered.save(output, format='PNG')
    output.seek(0)
    return output, 'png'

def get_metadata(file):
    """Extract image metadata"""
    img = Image.open(file)
    
    metadata = {
        'format': img.format,
        'mode': img.mode,
        'size': img.size,
        'width': img.width,
        'height': img.height
    }
    
    # Get EXIF data if available
    try:
        import piexif
        if hasattr(img, '_getexif'):
            exif = img._getexif()
            if exif:
                metadata['exif'] = {}
                for tag_id, value in exif.items():
                    tag = piexif.TAGS.get(tag_id, tag_id)
                    metadata['exif'][tag] = value
    except ImportError:
        # EXIF data not available without piexif
        pass
    
    return metadata

def images_to_pdf(files):
    """Convert multiple images to PDF"""
    images = []
    
    for file in files:
        img = Image.open(file)
        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            rgb_img.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = rgb_img
        images.append(img)
    
    output = io.BytesIO()
    if images:
        images[0].save(output, format='PDF', save_all=True, append_images=images[1:])
    output.seek(0)
    return output, 'pdf'

def pixelate_faces(file):
    """Detect and pixelate faces in image"""
    if not CV2_AVAILABLE:
        # Fallback: return original image if OpenCV not available
        file.seek(0)
        img = Image.open(file)
        output = io.BytesIO()
        img.save(output, format='PNG')
        output.seek(0)
        return output, 'png'
    
    # Read image
    file_bytes = file.read()
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Load face cascade
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # Detect faces
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    # Pixelate each face
    for (x, y, w, h) in faces:
        # Extract face region
        face = img[y:y+h, x:x+w]
        
        # Pixelate by resizing down and up
        small = cv2.resize(face, (16, 16), interpolation=cv2.INTER_LINEAR)
        pixelated = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)
        
        # Replace face region
        img[y:y+h, x:x+w] = pixelated
    
    # Convert back to PIL format
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(img_rgb)
    
    output = io.BytesIO()
    pil_img.save(output, format='PNG')
    output.seek(0)
    return output, 'png'

def create_meme(file, top_text='', bottom_text=''):
    """Add meme text to image"""
    img = Image.open(file)
    draw = ImageDraw.Draw(img)
    
    # Try to load Impact font or use default
    try:
        font_size = max(20, img.width // 20)
        font = ImageFont.truetype('arial.ttf', font_size)
    except:
        font = ImageFont.load_default()
    
    # Add top text
    if top_text:
        text_bbox = draw.textbbox((0, 0), top_text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        x = (img.width - text_width) // 2
        y = 10
        
        # Draw text with outline
        for adj in range(-2, 3):
            for adj2 in range(-2, 3):
                draw.text((x+adj, y+adj2), top_text, font=font, fill='black')
        draw.text((x, y), top_text, font=font, fill='white')
    
    # Add bottom text
    if bottom_text:
        text_bbox = draw.textbbox((0, 0), bottom_text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        x = (img.width - text_width) // 2
        y = img.height - text_height - 10
        
        # Draw text with outline
        for adj in range(-2, 3):
            for adj2 in range(-2, 3):
                draw.text((x+adj, y+adj2), bottom_text, font=font, fill='black')
        draw.text((x, y), bottom_text, font=font, fill='white')
    
    output = io.BytesIO()
    img.save(output, format='PNG')
    output.seek(0)
    return output, 'png'