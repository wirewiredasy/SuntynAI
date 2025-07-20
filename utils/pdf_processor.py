import io
import os
import tempfile
import PyPDF2
import fitz  # PyMuPDF
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.utils import ImageReader
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class PDFProcessor:
    """Professional PDF processing utilities"""
    
    @staticmethod
    def merge_pdfs(pdf_files):
        """Merge multiple PDF files"""
        try:
            merger = PyPDF2.PdfMerger()
            output = io.BytesIO()
            
            for pdf_file in pdf_files:
                pdf_file.seek(0)
                merger.append(pdf_file)
            
            merger.write(output)
            merger.close()
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"PDF merge error: {e}")
            raise
    
    @staticmethod
    def split_pdf(pdf_file, pages_per_split=1):
        """Split PDF into multiple files"""
        try:
            pdf_file.seek(0)
            reader = PyPDF2.PdfReader(pdf_file)
            outputs = []
            
            for i in range(0, len(reader.pages), pages_per_split):
                writer = PyPDF2.PdfWriter()
                for j in range(i, min(i + pages_per_split, len(reader.pages))):
                    writer.add_page(reader.pages[j])
                
                output = io.BytesIO()
                writer.write(output)
                output.seek(0)
                outputs.append(output)
            
            return outputs
        except Exception as e:
            logger.error(f"PDF split error: {e}")
            raise
    
    @staticmethod
    def compress_pdf(pdf_file, compression_level=0.7):
        """Compress PDF file size"""
        try:
            pdf_file.seek(0)
            doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
            output = io.BytesIO()
            
            # Apply compression
            for page_num in range(doc.page_count):
                page = doc[page_num]
                # Compress images
                mat = fitz.Matrix(compression_level, compression_level)
                pix = page.get_pixmap(matrix=mat)
                
            doc.save(output, garbage=4, deflate=True, clean=True)
            doc.close()
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"PDF compression error: {e}")
            raise
    
    @staticmethod
    def extract_text(pdf_file):
        """Extract text from PDF"""
        try:
            pdf_file.seek(0)
            doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
            text = ""
            
            for page in doc:
                text += page.get_text()
            
            doc.close()
            return text
        except Exception as e:
            logger.error(f"Text extraction error: {e}")
            raise
    
    @staticmethod
    def pdf_to_images(pdf_file, dpi=150):
        """Convert PDF pages to images"""
        try:
            pdf_file.seek(0)
            doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
            images = []
            
            for page_num in range(doc.page_count):
                page = doc[page_num]
                mat = fitz.Matrix(dpi/72, dpi/72)
                pix = page.get_pixmap(matrix=mat)
                img_data = pix.tobytes("png")
                
                image_buffer = io.BytesIO(img_data)
                images.append(image_buffer)
            
            doc.close()
            return images
        except Exception as e:
            logger.error(f"PDF to images error: {e}")
            raise
    
    @staticmethod
    def add_watermark(pdf_file, watermark_text, position="center"):
        """Add watermark to PDF"""
        try:
            pdf_file.seek(0)
            reader = PyPDF2.PdfReader(pdf_file)
            writer = PyPDF2.PdfWriter()
            
            # Create watermark
            watermark_buffer = io.BytesIO()
            c = canvas.Canvas(watermark_buffer, pagesize=letter)
            
            if position == "center":
                x, y = 300, 400
            elif position == "bottom-right":
                x, y = 450, 50
            else:  # top-left
                x, y = 50, 750
            
            c.setFillColorRGB(0.5, 0.5, 0.5)
            c.setFont("Helvetica", 40)
            c.drawString(x, y, watermark_text)
            c.save()
            
            watermark_buffer.seek(0)
            watermark_reader = PyPDF2.PdfReader(watermark_buffer)
            watermark_page = watermark_reader.pages[0]
            
            # Apply watermark to all pages
            for page in reader.pages:
                page.merge_page(watermark_page)
                writer.add_page(page)
            
            output = io.BytesIO()
            writer.write(output)
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"Watermark error: {e}")
            raise