"""
PDF Converter Tool - Convert PDFs to various formats
"""
import os
import tempfile
from werkzeug.utils import secure_filename
import fitz  # PyMuPDF
from PIL import Image
import io

def pdf_to_word(file):
    """
    Convert PDF to Word document
    """
    try:
        # Create temporary directory
        temp_dir = tempfile.mkdtemp()
        
        # Save uploaded file temporarily
        input_path = os.path.join(temp_dir, secure_filename(file.filename))
        file.save(input_path)
        
        # For now, extract text and create a simple text document
        # In production, you'd use pdf2docx library
        pdf_doc = fitz.open(input_path)
        text_content = ""
        
        for page_num in range(len(pdf_doc)):
            page = pdf_doc[page_num]
            text_content += f"--- Page {page_num + 1} ---\n"
            text_content += page.get_text()
            text_content += "\n\n"
        
        pdf_doc.close()
        
        # Create output file (simple text format for demo)
        base_name = os.path.splitext(secure_filename(file.filename))[0]
        output_filename = f"{base_name}_converted.txt"
        output_path = os.path.join(temp_dir, output_filename)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text_content)
        
        return True, output_path, "Converted PDF to text format"
        
    except Exception as e:
        return False, None, f"Error converting PDF to Word: {str(e)}"

def pdf_to_images(file, image_format="png"):
    """
    Convert PDF pages to images
    """
    try:
        # Create temporary directory
        temp_dir = tempfile.mkdtemp()
        
        # Save uploaded file temporarily
        input_path = os.path.join(temp_dir, secure_filename(file.filename))
        file.save(input_path)
        
        pdf_doc = fitz.open(input_path)
        image_files = []
        
        base_name = os.path.splitext(secure_filename(file.filename))[0]
        
        for page_num in range(len(pdf_doc)):
            page = pdf_doc[page_num]
            
            # Render page as image
            mat = fitz.Matrix(2, 2)  # 2x zoom for better quality
            pix = page.get_pixmap(matrix=mat)
            
            # Convert to PIL Image
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            
            # Save image
            output_filename = f"{base_name}_page_{page_num + 1}.{image_format}"
            output_path = os.path.join(temp_dir, output_filename)
            
            if image_format.lower() == "jpg":
                img = img.convert("RGB")
                img.save(output_path, "JPEG", quality=95)
            else:
                img.save(output_path, "PNG")
            
            image_files.append({
                'path': output_path,
                'filename': output_filename,
                'page': page_num + 1,
                'size': os.path.getsize(output_path)
            })
        
        pdf_doc.close()
        
        return True, image_files, f"Converted {len(image_files)} pages to images"
        
    except Exception as e:
        return False, [], f"Error converting PDF to images: {str(e)}"

def images_to_pdf(files):
    """
    Convert multiple images to PDF
    """
    try:
        # Create temporary directory
        temp_dir = tempfile.mkdtemp()
        
        images = []
        
        # Process uploaded images
        for file in files:
            if file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                temp_path = os.path.join(temp_dir, secure_filename(file.filename))
                file.save(temp_path)
                
                # Open and convert image
                img = Image.open(temp_path)
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                images.append(img)
        
        if not images:
            return False, None, "No valid image files provided"
        
        # Create PDF
        output_filename = "images_to_pdf.pdf"
        output_path = os.path.join(temp_dir, output_filename)
        
        # Save first image as PDF, then append others
        images[0].save(
            output_path, 
            "PDF", 
            resolution=100.0, 
            save_all=True, 
            append_images=images[1:] if len(images) > 1 else []
        )
        
        return True, output_path, f"Converted {len(images)} images to PDF"
        
    except Exception as e:
        return False, None, f"Error converting images to PDF: {str(e)}"

def extract_text_from_pdf(file):
    """
    Extract text content from PDF
    """
    try:
        # Create temporary directory
        temp_dir = tempfile.mkdtemp()
        
        # Save uploaded file temporarily
        input_path = os.path.join(temp_dir, secure_filename(file.filename))
        file.save(input_path)
        
        pdf_doc = fitz.open(input_path)
        text_content = ""
        
        for page_num in range(len(pdf_doc)):
            page = pdf_doc[page_num]
            text_content += page.get_text()
            text_content += "\n\n"
        
        pdf_doc.close()
        
        # Save as text file
        base_name = os.path.splitext(secure_filename(file.filename))[0]
        output_filename = f"{base_name}_text.txt"
        output_path = os.path.join(temp_dir, output_filename)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text_content.strip())
        
        # Get stats
        word_count = len(text_content.split())
        char_count = len(text_content)
        
        return True, output_path, {
            'word_count': word_count,
            'char_count': char_count,
            'pages': len(pdf_doc) if 'pdf_doc' in locals() else 0
        }
        
    except Exception as e:
        return False, None, f"Error extracting text: {str(e)}"