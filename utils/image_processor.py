import io
import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw, ImageFont
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    """Professional image processing utilities"""
    
    @staticmethod
    def resize_image(image, width, height, maintain_aspect=True):
        """Resize image with optional aspect ratio maintenance"""
        try:
            if maintain_aspect:
                image.thumbnail((width, height), Image.Resampling.LANCZOS)
                return image
            else:
                return image.resize((width, height), Image.Resampling.LANCZOS)
        except Exception as e:
            logger.error(f"Image resize error: {e}")
            raise
    
    @staticmethod
    def compress_image(image, quality=85, format='JPEG'):
        """Compress image with specified quality"""
        try:
            output = io.BytesIO()
            if format.upper() == 'PNG':
                image.save(output, format='PNG', optimize=True)
            else:
                # Convert to RGB if necessary for JPEG
                if image.mode in ('RGBA', 'LA', 'P'):
                    rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                    rgb_image.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                    image = rgb_image
                image.save(output, format='JPEG', quality=quality, optimize=True)
            
            output.seek(0)
            return Image.open(output)
        except Exception as e:
            logger.error(f"Image compression error: {e}")
            raise
    
    @staticmethod
    def convert_format(image, target_format):
        """Convert image to different format"""
        try:
            output = io.BytesIO()
            
            if target_format.upper() == 'PNG':
                image.save(output, format='PNG', optimize=True)
            elif target_format.upper() in ['JPG', 'JPEG']:
                if image.mode in ('RGBA', 'LA', 'P'):
                    rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                    rgb_image.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                    image = rgb_image
                image.save(output, format='JPEG', quality=95)
            elif target_format.upper() == 'WEBP':
                image.save(output, format='WEBP', quality=90)
            
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"Format conversion error: {e}")
            raise
    
    @staticmethod
    def remove_background(image):
        """Remove background using edge detection"""
        try:
            # Convert PIL to OpenCV format
            img_array = np.array(image)
            if len(img_array.shape) == 3:
                img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            
            # Create mask using edge detection
            gray = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            
            # Find contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Create mask
            mask = np.zeros(gray.shape, np.uint8)
            if contours:
                largest_contour = max(contours, key=cv2.contourArea)
                cv2.fillPoly(mask, [largest_contour], 255)
            
            # Apply mask
            result = cv2.bitwise_and(img_array, img_array, mask=mask)
            
            # Convert back to PIL
            result_rgb = cv2.cvtColor(result, cv2.COLOR_BGR2RGB)
            
            # Add alpha channel for transparency
            result_rgba = np.dstack((result_rgb, mask))
            
            return Image.fromarray(result_rgba, 'RGBA')
        except Exception as e:
            logger.error(f"Background removal error: {e}")
            raise
    
    @staticmethod
    def apply_filter(image, filter_type):
        """Apply various image filters"""
        try:
            if filter_type == "blur":
                return image.filter(ImageFilter.BLUR)
            elif filter_type == "sharpen":
                return image.filter(ImageFilter.SHARPEN)
            elif filter_type == "smooth":
                return image.filter(ImageFilter.SMOOTH)
            elif filter_type == "detail":
                return image.filter(ImageFilter.DETAIL)
            elif filter_type == "edge_enhance":
                return image.filter(ImageFilter.EDGE_ENHANCE)
            elif filter_type == "emboss":
                return image.filter(ImageFilter.EMBOSS)
            elif filter_type == "find_edges":
                return image.filter(ImageFilter.FIND_EDGES)
            elif filter_type == "contour":
                return image.filter(ImageFilter.CONTOUR)
            else:
                return image
        except Exception as e:
            logger.error(f"Filter application error: {e}")
            raise
    
    @staticmethod
    def adjust_brightness(image, factor):
        """Adjust image brightness"""
        try:
            enhancer = ImageEnhance.Brightness(image)
            return enhancer.enhance(factor)
        except Exception as e:
            logger.error(f"Brightness adjustment error: {e}")
            raise
    
    @staticmethod
    def adjust_contrast(image, factor):
        """Adjust image contrast"""
        try:
            enhancer = ImageEnhance.Contrast(image)
            return enhancer.enhance(factor)
        except Exception as e:
            logger.error(f"Contrast adjustment error: {e}")
            raise
    
    @staticmethod
    def rotate_image(image, angle):
        """Rotate image by specified angle"""
        try:
            return image.rotate(angle, expand=True, fillcolor='white')
        except Exception as e:
            logger.error(f"Image rotation error: {e}")
            raise
    
    @staticmethod
    def flip_image(image, direction):
        """Flip image horizontally or vertically"""
        try:
            if direction == "horizontal":
                return image.transpose(Image.FLIP_LEFT_RIGHT)
            elif direction == "vertical":
                return image.transpose(Image.FLIP_TOP_BOTTOM)
            else:
                return image
        except Exception as e:
            logger.error(f"Image flip error: {e}")
            raise
    
    @staticmethod
    def add_watermark(image, text, position="bottom-right", opacity=0.5):
        """Add text watermark to image"""
        try:
            # Create a transparent overlay
            overlay = Image.new('RGBA', image.size, (255, 255, 255, 0))
            draw = ImageDraw.Draw(overlay)
            
            # Try to load a font, fallback to default
            try:
                font = ImageFont.truetype("arial.ttf", 36)
            except:
                font = ImageFont.load_default()
            
            # Calculate position
            text_bbox = draw.textbbox((0, 0), text, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]
            
            if position == "bottom-right":
                x = image.width - text_width - 20
                y = image.height - text_height - 20
            elif position == "bottom-left":
                x = 20
                y = image.height - text_height - 20
            elif position == "top-right":
                x = image.width - text_width - 20
                y = 20
            elif position == "top-left":
                x = 20
                y = 20
            else:  # center
                x = (image.width - text_width) // 2
                y = (image.height - text_height) // 2
            
            # Add text with opacity
            alpha = int(255 * opacity)
            draw.text((x, y), text, font=font, fill=(255, 255, 255, alpha))
            
            # Composite with original image
            watermarked = Image.alpha_composite(image.convert('RGBA'), overlay)
            return watermarked.convert('RGB')
        except Exception as e:
            logger.error(f"Watermark error: {e}")
            raise