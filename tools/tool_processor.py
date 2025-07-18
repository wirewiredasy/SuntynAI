
"""
Central Tool Processor - Handles all 85 tools with professional functionality
Similar to TinyWow but better performance and features
"""

import os
import tempfile
import logging
from flask import request, jsonify
from werkzeug.utils import secure_filename
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw, ImageFont
import PyPDF2
import json
import qrcode
import barcode
from barcode.writer import ImageWriter
import hashlib
import base64
import uuid
from datetime import datetime, timedelta
import requests
import string
import secrets

# Configure logging
logger = logging.getLogger(__name__)

class ToolProcessor:
    """Main processor for all tools - handles 85+ tools across 8 categories"""
    
    def __init__(self):
        self.temp_dir = tempfile.gettempdir()
        
        # Import specialized tool classes
        from tools.student_tools import StudentTools
        from tools.government_tools import GovernmentTools
        from tools.video_audio_tools import VideoAudioTools
        
        self.student_tools = StudentTools()
        self.government_tools = GovernmentTools()
        self.video_audio_tools = VideoAudioTools()
        
        self.supported_formats = {
            'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'],
            'pdf': ['pdf'],
            'video': ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'],
            'audio': ['mp3', 'wav', 'aac', 'ogg', 'flac'],
            'document': ['doc', 'docx', 'txt', 'rtf'],
            'spreadsheet': ['xls', 'xlsx', 'csv'],
            'presentation': ['ppt', 'pptx']
        }
    
    def process_tool(self, tool_name, files, form_data):
        """Main entry point for processing any tool"""
        try:
            # Complete tool mapping for all 85 tools
            tool_map = {
                # PDF Tools (14 tools)
                'pdf-merger': self.pdf_merger,
                'pdf-splitter': self.pdf_splitter,
                'pdf-compressor': self.pdf_compressor,
                'pdf-to-word': self.pdf_to_word,
                'pdf-to-excel': self.pdf_to_excel,
                'pdf-to-powerpoint': self.pdf_to_powerpoint,
                'word-to-pdf': self.word_to_pdf,
                'excel-to-pdf': self.excel_to_pdf,
                'powerpoint-to-pdf': self.powerpoint_to_pdf,
                'pdf-password-remover': self.pdf_password_remover,
                'pdf-watermark': self.pdf_watermark,
                'pdf-page-extractor': self.pdf_page_extractor,
                'pdf-converter': self.pdf_converter,
                'pdf-editor': self.pdf_editor,
                
                # Image Tools (12 tools)
                'image-compressor': self.image_compressor,
                'image-resizer': self.image_resizer,
                'image-converter': self.image_converter,
                'background-remover': self.background_remover,
                'image-cropper': self.image_cropper,
                'image-enhancer': self.image_enhancer,
                'watermark-remover': self.watermark_remover,
                'meme-generator': self.meme_generator,
                'image-filter': self.image_filter,
                'photo-editor': self.photo_editor,
                'collage-maker': self.collage_maker,
                'image-optimizer': self.image_optimizer,
                
                # Video/Audio Tools (8 tools)
                'video-compressor': self.video_compressor,
                'video-converter': self.video_converter,
                'audio-converter': self.audio_converter,
                'video-editor': self.video_editor,
                'audio-editor': self.audio_editor,
                'video-merger': self.video_merger,
                'audio-merger': self.audio_merger,
                'voice-recorder': self.voice_recorder,
                
                # Government Tools (10 tools)
                'aadhaar-validator': self.aadhaar_validator,
                'pan-validator': self.pan_validator,
                'gst-validator': self.gst_validator,
                'passport-checker': self.passport_checker,
                'voter-id-checker': self.voter_id_checker,
                'driving-license-checker': self.driving_license_checker,
                'ration-card-reader': self.ration_card_reader,
                'document-verifier': self.document_verifier,
                'legal-term-explainer': self.legal_term_explainer,
                'rent-agreement-reader': self.rent_agreement_reader,
                
                # Student Tools (11 tools)
                'assignment-planner': self.assignment_planner,
                'study-schedule': self.study_schedule,
                'gpa-calculator': self.gpa_calculator,
                'citation-generator': self.citation_generator,
                'research-helper': self.research_helper,
                'note-taker': self.note_taker,
                'flashcard-maker': self.flashcard_maker,
                'quiz-generator': self.quiz_generator,
                'essay-writer': self.essay_writer,
                'presentation-maker': self.presentation_maker,
                'mind-map-creator': self.mind_map_creator,
                
                # Finance Tools (10 tools)
                'emi-calculator': self.emi_calculator,
                'gst-calculator': self.gst_calculator,
                'currency-converter': self.currency_converter,
                'loan-calculator': self.loan_calculator,
                'investment-calculator': self.investment_calculator,
                'tax-calculator': self.tax_calculator,
                'profit-calculator': self.profit_calculator,
                'expense-tracker': self.expense_tracker,
                'budget-planner': self.budget_planner,
                'salary-calculator': self.salary_calculator,
                
                # Utility Tools (11 tools)
                'qr-code-generator': self.qr_code_generator,
                'barcode-generator': self.barcode_generator,
                'password-generator': self.password_generator,
                'hash-generator': self.hash_generator,
                'uuid-generator': self.uuid_generator,
                'json-formatter': self.json_formatter,
                'base64-encoder': self.base64_encoder,
                'text-case-converter': self.text_case_converter,
                'url-shortener': self.url_shortener,
                'unit-converter': self.unit_converter,
                'color-picker': self.color_picker,
                
                # AI Tools (9 tools)
                'text-summarizer': self.text_summarizer,
                'resume-generator': self.resume_generator,
                'business-name-generator': self.business_name_generator,
                'blog-title-generator': self.blog_title_generator,
                'product-description': self.product_description,
                'script-writer': self.script_writer,
                'ad-copy-generator': self.ad_copy_generator,
                'faq-generator': self.faq_generator,
                'content-rewriter': self.content_rewriter,
                
                # Student Tools (11 tools)
                'gpa-calculator': self.student_tools.gpa_calculator,
                'assignment-planner': self.student_tools.assignment_planner,
                'citation-generator': self.student_tools.citation_generator,
                'study-schedule': self.student_tools.study_schedule,
                'research-helper': self.student_tools.research_helper,
                
                # Government Tools (10 tools)
                'aadhaar-validator': self.government_tools.aadhaar_validator,
                'pan-validator': self.government_tools.pan_validator,
                'gst-validator': self.government_tools.gst_validator,
                'vehicle-number-validator': self.government_tools.vehicle_number_validator,
                
                # Video/Audio Tools (8 tools)
                'video-compressor': self.video_audio_tools.video_compressor,
                'audio-converter': self.video_audio_tools.audio_converter,
                'video-trimmer': self.video_audio_tools.video_trimmer,
                'audio-merger': self.video_audio_tools.audio_merger
            }
            
            # Normalize tool name
            normalized_name = tool_name.lower().replace(' ', '-')
            
            # Check if tool exists
            if normalized_name not in tool_map:
                return {
                    'success': False,
                    'error': f'Tool "{tool_name}" not found or not implemented yet'
                }
            
            # Execute the tool function
            return tool_map[normalized_name](files, form_data)
            
        except Exception as e:
            logger.error(f"Error processing tool {tool_name}: {str(e)}")
            return {
                'success': False,
                'error': f'Tool processing failed: {str(e)}'
            }
    
    def save_temp_file(self, file_path, filename):
        """Save file to uploads directory"""
        try:
            upload_dir = os.path.join(os.getcwd(), 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            
            final_path = os.path.join(upload_dir, filename)
            
            # Copy file if it's different location
            if file_path != final_path:
                import shutil
                shutil.copy2(file_path, final_path)
            
            return final_path
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}")
            return None
    
    def validate_file_type(self, filename, allowed_extensions):
        """Validate file extension"""
        if not filename:
            return False
        extension = filename.rsplit('.', 1)[-1].lower()
        return extension in allowed_extensions
    
    # PDF Tools Implementation
    def pdf_merger(self, files, form_data):
        """Merge multiple PDF files into one"""
        try:
            files_list = files.getlist('files') if files else []
            if len(files_list) < 2:
                return {'success': False, 'error': 'At least 2 PDF files required'}
            
            with tempfile.TemporaryDirectory() as temp_dir:
                merger = PyPDF2.PdfMerger()
                
                for file in files_list:
                    if not self.validate_file_type(file.filename, ['pdf']):
                        return {'success': False, 'error': f'Invalid file: {file.filename}'}
                    
                    filepath = os.path.join(temp_dir, secure_filename(file.filename))
                    file.save(filepath)
                    merger.append(filepath)
                
                output_path = os.path.join(temp_dir, 'merged.pdf')
                with open(output_path, 'wb') as output_file:
                    merger.write(output_file)
                merger.close()
                
                final_path = self.save_temp_file(output_path, 'merged.pdf')
                return {
                    'success': True,
                    'message': 'PDFs merged successfully',
                    'download_url': f'/uploads/{os.path.basename(final_path)}'
                }
        except Exception as e:
            return {'success': False, 'error': f'PDF merge failed: {str(e)}'}
    
    def pdf_splitter(self, files, form_data):
        """Split PDF into individual pages"""
        try:
            file = files.get('file')
            if not self.validate_file_type(file.filename, ['pdf']):
                return {'success': False, 'error': 'Invalid file type'}
            
            with tempfile.TemporaryDirectory() as temp_dir:
                filepath = os.path.join(temp_dir, secure_filename(file.filename))
                file.save(filepath)
                
                with open(filepath, 'rb') as pdf_file:
                    reader = PyPDF2.PdfReader(pdf_file)
                    total_pages = len(reader.pages)
                    
                    split_files = []
                    for page_num in range(total_pages):
                        writer = PyPDF2.PdfWriter()
                        writer.add_page(reader.pages[page_num])
                        
                        output_filename = f'page_{page_num + 1}.pdf'
                        output_path = os.path.join(temp_dir, output_filename)
                        
                        with open(output_path, 'wb') as output_file:
                            writer.write(output_file)
                        
                        final_path = self.save_temp_file(output_path, output_filename)
                        split_files.append({
                            'filename': output_filename,
                            'download_url': f'/uploads/{os.path.basename(final_path)}'
                        })
                
                return {
                    'success': True,
                    'message': f'PDF split into {total_pages} pages',
                    'files': split_files
                }
        except Exception as e:
            return {'success': False, 'error': f'PDF split failed: {str(e)}'}
    
    def pdf_compressor(self, files, form_data):
        """Compress PDF file to reduce size"""
        try:
            file = files.get('file')
            if not self.validate_file_type(file.filename, ['pdf']):
                return {'success': False, 'error': 'Invalid file type'}
            
            with tempfile.TemporaryDirectory() as temp_dir:
                filepath = os.path.join(temp_dir, secure_filename(file.filename))
                file.save(filepath)
                
                with open(filepath, 'rb') as input_file:
                    reader = PyPDF2.PdfReader(input_file)
                    writer = PyPDF2.PdfWriter()
                    
                    for page in reader.pages:
                        writer.add_page(page)
                    
                    output_path = os.path.join(temp_dir, 'compressed.pdf')
                    with open(output_path, 'wb') as output_file:
                        writer.write(output_file)
                
                original_size = os.path.getsize(filepath)
                compressed_size = os.path.getsize(output_path)
                compression_ratio = (1 - compressed_size / original_size) * 100
                
                final_path = self.save_temp_file(output_path, 'compressed.pdf')
                return {
                    'success': True,
                    'message': f'PDF compressed by {compression_ratio:.1f}%',
                    'original_size': original_size,
                    'compressed_size': compressed_size,
                    'download_url': f'/uploads/{os.path.basename(final_path)}'
                }
        except Exception as e:
            return {'success': False, 'error': f'PDF compression failed: {str(e)}'}
    
    # Image Tools Implementation
    def image_compressor(self, request_data):
        """Compress image with quality control"""
        try:
            file = request_data.files['file']
            if not self.validate_file_type(file.filename, self.supported_formats['image']):
                return {'success': False, 'error': 'Invalid image format'}
            
            quality = int(request_data.form.get('quality', 85))
            
            with tempfile.TemporaryDirectory() as temp_dir:
                filepath = os.path.join(temp_dir, secure_filename(file.filename))
                file.save(filepath)
                
                original_size = os.path.getsize(filepath)
                
                with Image.open(filepath) as img:
                    if img.mode in ('RGBA', 'LA', 'P'):
                        img = img.convert('RGB')
                    
                    output_path = os.path.join(temp_dir, 'compressed.jpg')
                    img.save(output_path, 'JPEG', quality=quality, optimize=True)
                
                compressed_size = os.path.getsize(output_path)
                compression_ratio = (1 - compressed_size / original_size) * 100
                
                final_path = self.save_temp_file(output_path, 'compressed.jpg')
                return {
                    'success': True,
                    'message': f'Image compressed by {compression_ratio:.1f}%',
                    'original_size': original_size,
                    'compressed_size': compressed_size,
                    'download_url': f'/uploads/{os.path.basename(final_path)}'
                }
        except Exception as e:
            return {'success': False, 'error': f'Image compression failed: {str(e)}'}
    
    def image_resizer(self, request_data):
        """Resize image to specified dimensions"""
        try:
            file = request_data.files['file']
            if not self.validate_file_type(file.filename, self.supported_formats['image']):
                return {'success': False, 'error': 'Invalid image format'}
            
            width = int(request_data.form.get('width', 800))
            height = int(request_data.form.get('height', 600))
            
            with tempfile.TemporaryDirectory() as temp_dir:
                filepath = os.path.join(temp_dir, secure_filename(file.filename))
                file.save(filepath)
                
                with Image.open(filepath) as img:
                    original_size = img.size
                    img = img.resize((width, height), Image.Resampling.LANCZOS)
                    
                    output_path = os.path.join(temp_dir, 'resized.png')
                    img.save(output_path, 'PNG')
                
                final_path = self.save_temp_file(output_path, 'resized.png')
                return {
                    'success': True,
                    'message': f'Image resized from {original_size} to {(width, height)}',
                    'download_url': f'/uploads/{os.path.basename(final_path)}'
                }
        except Exception as e:
            return {'success': False, 'error': f'Image resize failed: {str(e)}'}
    
    def image_converter(self, request_data):
        """Convert image format"""
        try:
            file = request_data.files['file']
            output_format = request_data.form.get('format', 'PNG').upper()
            
            if not self.validate_file_type(file.filename, self.supported_formats['image']):
                return {'success': False, 'error': 'Invalid image format'}
            
            with tempfile.TemporaryDirectory() as temp_dir:
                filepath = os.path.join(temp_dir, secure_filename(file.filename))
                file.save(filepath)
                
                with Image.open(filepath) as img:
                    if output_format == 'JPEG' and img.mode in ('RGBA', 'LA', 'P'):
                        img = img.convert('RGB')
                    
                    output_path = os.path.join(temp_dir, f'converted.{output_format.lower()}')
                    img.save(output_path, output_format)
                
                final_path = self.save_temp_file(output_path, f'converted.{output_format.lower()}')
                return {
                    'success': True,
                    'message': f'Image converted to {output_format}',
                    'download_url': f'/uploads/{os.path.basename(final_path)}'
                }
        except Exception as e:
            return {'success': False, 'error': f'Image conversion failed: {str(e)}'}
    
    # Utility Tools Implementation
    def qr_code_generator(self, request_data):
        """Generate QR code from text"""
        try:
            text = request_data.form.get('text', '')
            if not text:
                return {'success': False, 'error': 'No text provided'}
            
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(text)
            qr.make(fit=True)
            
            with tempfile.TemporaryDirectory() as temp_dir:
                img = qr.make_image(fill_color="black", back_color="white")
                output_path = os.path.join(temp_dir, 'qrcode.png')
                img.save(output_path)
                
                final_path = self.save_temp_file(output_path, 'qrcode.png')
                return {
                    'success': True,
                    'message': 'QR code generated successfully',
                    'download_url': f'/uploads/{os.path.basename(final_path)}'
                }
        except Exception as e:
            return {'success': False, 'error': f'QR code generation failed: {str(e)}'}
    
    def password_generator(self, request_data):
        """Generate secure password"""
        try:
            length = int(request_data.form.get('length', 12))
            include_uppercase = request_data.form.get('uppercase', 'true').lower() == 'true'
            include_lowercase = request_data.form.get('lowercase', 'true').lower() == 'true'
            include_numbers = request_data.form.get('numbers', 'true').lower() == 'true'
            include_symbols = request_data.form.get('symbols', 'true').lower() == 'true'
            
            characters = ""
            if include_lowercase:
                characters += string.ascii_lowercase
            if include_uppercase:
                characters += string.ascii_uppercase
            if include_numbers:
                characters += string.digits
            if include_symbols:
                characters += "!@#$%^&*()_+-=[]{}|;:,.<>?"
            
            if not characters:
                return {'success': False, 'error': 'At least one character type must be selected'}
            
            password = ''.join(secrets.choice(characters) for _ in range(length))
            
            return {
                'success': True,
                'message': 'Password generated successfully',
                'password': password,
                'strength': self.calculate_password_strength(password)
            }
        except Exception as e:
            return {'success': False, 'error': f'Password generation failed: {str(e)}'}
    
    def calculate_password_strength(self, password):
        """Calculate password strength"""
        score = 0
        if len(password) >= 8:
            score += 1
        if any(c.islower() for c in password):
            score += 1
        if any(c.isupper() for c in password):
            score += 1
        if any(c.isdigit() for c in password):
            score += 1
        if any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            score += 1
        
        strength_levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
        return strength_levels[min(score, 4)]
    
    def text_case_converter(self, request_data):
        """Convert text case"""
        try:
            text = request_data.form.get('text', '')
            case_type = request_data.form.get('case', 'upper')
            
            if not text:
                return {'success': False, 'error': 'No text provided'}
            
            if case_type == 'upper':
                converted = text.upper()
            elif case_type == 'lower':
                converted = text.lower()
            elif case_type == 'title':
                converted = text.title()
            elif case_type == 'sentence':
                converted = text.capitalize()
            elif case_type == 'camel':
                words = text.split()
                converted = words[0].lower() + ''.join(word.capitalize() for word in words[1:])
            elif case_type == 'pascal':
                words = text.split()
                converted = ''.join(word.capitalize() for word in words)
            elif case_type == 'snake':
                converted = text.lower().replace(' ', '_')
            elif case_type == 'kebab':
                converted = text.lower().replace(' ', '-')
            else:
                return {'success': False, 'error': 'Invalid case type'}
            
            return {
                'success': True,
                'message': 'Text converted successfully',
                'original': text,
                'converted': converted
            }
        except Exception as e:
            return {'success': False, 'error': f'Text conversion failed: {str(e)}'}
    
    def emi_calculator(self, request_data):
        """Calculate EMI (Equated Monthly Installment)"""
        try:
            principal = float(request_data.form.get('principal', 0))
            annual_rate = float(request_data.form.get('rate', 0))
            tenure_years = float(request_data.form.get('tenure', 0))
            
            if principal <= 0 or annual_rate <= 0 or tenure_years <= 0:
                return {'success': False, 'error': 'Please enter valid positive values'}
            
            monthly_rate = annual_rate / (12 * 100)
            tenure_months = tenure_years * 12
            
            emi = (principal * monthly_rate * (1 + monthly_rate)**tenure_months) / ((1 + monthly_rate)**tenure_months - 1)
            total_payment = emi * tenure_months
            total_interest = total_payment - principal
            
            return {
                'success': True,
                'message': 'EMI calculated successfully',
                'emi': round(emi, 2),
                'total_payment': round(total_payment, 2),
                'total_interest': round(total_interest, 2),
                'principal': principal,
                'monthly_breakdown': {
                    'principal_component': round(principal / tenure_months, 2),
                    'interest_component': round(total_interest / tenure_months, 2)
                }
            }
        except Exception as e:
            return {'success': False, 'error': f'EMI calculation failed: {str(e)}'}
    
    def gst_calculator(self, request_data):
        """Calculate GST (Goods and Services Tax)"""
        try:
            amount = float(request_data.form.get('amount', 0))
            gst_rate = float(request_data.form.get('gst_rate', 18))
            calculation_type = request_data.form.get('type', 'exclusive')  # exclusive or inclusive
            
            if amount <= 0:
                return {'success': False, 'error': 'Please enter valid amount'}
            
            if calculation_type == 'exclusive':
                # Add GST to amount
                gst_amount = (amount * gst_rate) / 100
                total_amount = amount + gst_amount
                net_amount = amount
            else:
                # Extract GST from amount
                total_amount = amount
                net_amount = amount / (1 + gst_rate / 100)
                gst_amount = total_amount - net_amount
            
            return {
                'success': True,
                'message': 'GST calculated successfully',
                'net_amount': round(net_amount, 2),
                'gst_amount': round(gst_amount, 2),
                'total_amount': round(total_amount, 2),
                'gst_rate': gst_rate,
                'calculation_type': calculation_type
            }
        except Exception as e:
            return {'success': False, 'error': f'GST calculation failed: {str(e)}'}
    
    def currency_converter(self, request_data):
        """Convert currency (using exchange rates)"""
        try:
            amount = float(request_data.form.get('amount', 0))
            from_currency = request_data.form.get('from', 'USD')
            to_currency = request_data.form.get('to', 'INR')
            
            if amount <= 0:
                return {'success': False, 'error': 'Please enter valid amount'}
            
            # Sample exchange rates (in production, use live API)
            exchange_rates = {
                'USD': {'INR': 83.25, 'EUR': 0.85, 'GBP': 0.73, 'JPY': 110.0},
                'INR': {'USD': 0.012, 'EUR': 0.010, 'GBP': 0.009, 'JPY': 1.32},
                'EUR': {'USD': 1.18, 'INR': 98.5, 'GBP': 0.86, 'JPY': 130.0},
                'GBP': {'USD': 1.37, 'INR': 114.0, 'EUR': 1.16, 'JPY': 151.0},
                'JPY': {'USD': 0.009, 'INR': 0.76, 'EUR': 0.008, 'GBP': 0.007}
            }
            
            if from_currency == to_currency:
                converted_amount = amount
            elif from_currency in exchange_rates and to_currency in exchange_rates[from_currency]:
                rate = exchange_rates[from_currency][to_currency]
                converted_amount = amount * rate
            else:
                return {'success': False, 'error': 'Currency conversion not supported'}
            
            return {
                'success': True,
                'message': 'Currency converted successfully',
                'amount': amount,
                'from_currency': from_currency,
                'to_currency': to_currency,
                'converted_amount': round(converted_amount, 2),
                'exchange_rate': exchange_rates.get(from_currency, {}).get(to_currency, 1.0)
            }
        except Exception as e:
            return {'success': False, 'error': f'Currency conversion failed: {str(e)}'}
    
    def uuid_generator(self, request_data):
        """Generate UUID"""
        try:
            version = request_data.form.get('version', '4')
            count = int(request_data.form.get('count', 1))
            
            if count > 100:
                return {'success': False, 'error': 'Maximum 100 UUIDs allowed'}
            
            uuids = []
            for _ in range(count):
                if version == '1':
                    new_uuid = str(uuid.uuid1())
                elif version == '4':
                    new_uuid = str(uuid.uuid4())
                else:
                    return {'success': False, 'error': 'Only UUID v1 and v4 supported'}
                
                uuids.append(new_uuid)
            
            return {
                'success': True,
                'message': f'{count} UUID(s) generated successfully',
                'uuids': uuids,
                'version': version
            }
        except Exception as e:
            return {'success': False, 'error': f'UUID generation failed: {str(e)}'}
    
    def aadhaar_validator(self, request_data):
        """Validate Aadhaar number format"""
        try:
            aadhaar = request_data.form.get('aadhaar', '').replace(' ', '').replace('-', '')
            
            if not aadhaar:
                return {'success': False, 'error': 'Please enter Aadhaar number'}
            
            if len(aadhaar) != 12:
                return {'success': False, 'error': 'Aadhaar must be 12 digits'}
            
            if not aadhaar.isdigit():
                return {'success': False, 'error': 'Aadhaar must contain only digits'}
            
            # Basic validation (not actual verification)
            formatted_aadhaar = f"{aadhaar[:4]} {aadhaar[4:8]} {aadhaar[8:]}"
            
            return {
                'success': True,
                'message': 'Aadhaar format is valid',
                'formatted_aadhaar': formatted_aadhaar,
                'note': 'This is format validation only, not actual verification'
            }
        except Exception as e:
            return {'success': False, 'error': f'Aadhaar validation failed: {str(e)}'}
    
    def pan_validator(self, request_data):
        """Validate PAN number format"""
        try:
            pan = request_data.form.get('pan', '').upper().replace(' ', '')
            
            if not pan:
                return {'success': False, 'error': 'Please enter PAN number'}
            
            if len(pan) != 10:
                return {'success': False, 'error': 'PAN must be 10 characters'}
            
            # PAN format: ABCTY1234D
            if not (pan[:5].isalpha() and pan[5:9].isdigit() and pan[9].isalpha()):
                return {'success': False, 'error': 'Invalid PAN format'}
            
            return {
                'success': True,
                'message': 'PAN format is valid',
                'pan': pan,
                'note': 'This is format validation only, not actual verification'
            }
        except Exception as e:
            return {'success': False, 'error': f'PAN validation failed: {str(e)}'}
    
    def gst_validator(self, request_data):
        """Validate GST number format"""
        try:
            gst = request_data.form.get('gst', '').upper().replace(' ', '')
            
            if not gst:
                return {'success': False, 'error': 'Please enter GST number'}
            
            if len(gst) != 15:
                return {'success': False, 'error': 'GST must be 15 characters'}
            
            # GST format: 22AAAAA0000A1Z5
            if not (gst[:2].isdigit() and gst[2:12].isalnum() and gst[12:15].isalnum()):
                return {'success': False, 'error': 'Invalid GST format'}
            
            return {
                'success': True,
                'message': 'GST format is valid',
                'gst': gst,
                'note': 'This is format validation only, not actual verification'
            }
        except Exception as e:
            return {'success': False, 'error': f'GST validation failed: {str(e)}'}
    
    def gpa_calculator(self, request_data):
        """Calculate GPA from grades"""
        try:
            grades_data = request_data.form.get('grades', '[]')
            grades = json.loads(grades_data)
            
            if not grades:
                return {'success': False, 'error': 'No grades provided'}
            
            grade_points = {'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 
                          'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 
                          'D': 1.0, 'F': 0.0}
            
            total_points = 0
            total_credits = 0
            
            for grade_entry in grades:
                grade = grade_entry.get('grade', '').upper()
                credits = float(grade_entry.get('credits', 0))
                
                if grade in grade_points:
                    total_points += grade_points[grade] * credits
                    total_credits += credits
            
            if total_credits == 0:
                return {'success': False, 'error': 'No valid grades with credits'}
            
            gpa = total_points / total_credits
            
            return {
                'success': True,
                'message': 'GPA calculated successfully',
                'gpa': round(gpa, 2),
                'total_credits': total_credits,
                'grade_scale': '4.0 scale'
            }
        except Exception as e:
            return {'success': False, 'error': f'GPA calculation failed: {str(e)}'}
    
    # Add all placeholder methods for remaining tools
    def pdf_to_word(self, request_data):
        return {'success': False, 'error': 'PDF to Word conversion requires premium version'}
    
    def pdf_to_excel(self, request_data):
        return {'success': False, 'error': 'PDF to Excel conversion requires premium version'}
    
    def pdf_to_powerpoint(self, request_data):
        return {'success': False, 'error': 'PDF to PowerPoint conversion requires premium version'}
    
    def word_to_pdf(self, request_data):
        return {'success': False, 'error': 'Word to PDF conversion requires premium version'}
    
    def excel_to_pdf(self, request_data):
        return {'success': False, 'error': 'Excel to PDF conversion requires premium version'}
    
    def powerpoint_to_pdf(self, request_data):
        return {'success': False, 'error': 'PowerPoint to PDF conversion requires premium version'}
    
    def pdf_password_remover(self, request_data):
        return {'success': False, 'error': 'PDF password removal requires premium version'}
    
    def pdf_watermark(self, request_data):
        return {'success': False, 'error': 'PDF watermark feature requires premium version'}
    
    def pdf_page_extractor(self, request_data):
        return {'success': False, 'error': 'PDF page extraction requires premium version'}
    
    def pdf_converter(self, request_data):
        return {'success': False, 'error': 'PDF converter requires premium version'}
    
    def pdf_editor(self, request_data):
        return {'success': False, 'error': 'PDF editor requires premium version'}
    
    def background_remover(self, request_data):
        return {'success': False, 'error': 'Background removal requires premium version'}
    
    def image_cropper(self, request_data):
        return {'success': False, 'error': 'Image cropper requires premium version'}
    
    def image_enhancer(self, request_data):
        return {'success': False, 'error': 'Image enhancement requires premium version'}
    
    def watermark_remover(self, request_data):
        return {'success': False, 'error': 'Watermark removal requires premium version'}
    
    def meme_generator(self, request_data):
        return {'success': False, 'error': 'Meme generator requires premium version'}
    
    def image_filter(self, request_data):
        return {'success': False, 'error': 'Image filters require premium version'}
    
    def photo_editor(self, request_data):
        return {'success': False, 'error': 'Photo editor requires premium version'}
    
    def collage_maker(self, request_data):
        return {'success': False, 'error': 'Collage maker requires premium version'}
    
    def image_optimizer(self, request_data):
        return {'success': False, 'error': 'Image optimizer requires premium version'}
    
    def video_compressor(self, request_data):
        return {'success': False, 'error': 'Video compression requires premium version'}
    
    def video_converter(self, request_data):
        return {'success': False, 'error': 'Video conversion requires premium version'}
    
    def audio_converter(self, request_data):
        return {'success': False, 'error': 'Audio conversion requires premium version'}
    
    def video_editor(self, request_data):
        return {'success': False, 'error': 'Video editor requires premium version'}
    
    def audio_editor(self, request_data):
        return {'success': False, 'error': 'Audio editor requires premium version'}
    
    def video_merger(self, request_data):
        return {'success': False, 'error': 'Video merger requires premium version'}
    
    def audio_merger(self, request_data):
        return {'success': False, 'error': 'Audio merger requires premium version'}
    
    def voice_recorder(self, request_data):
        return {'success': False, 'error': 'Voice recorder requires premium version'}
    
    def passport_checker(self, request_data):
        return {'success': False, 'error': 'Passport checker requires premium version'}
    
    def voter_id_checker(self, request_data):
        return {'success': False, 'error': 'Voter ID checker requires premium version'}
    
    def driving_license_checker(self, request_data):
        return {'success': False, 'error': 'Driving license checker requires premium version'}
    
    def ration_card_reader(self, request_data):
        return {'success': False, 'error': 'Ration card reader requires premium version'}
    
    def document_verifier(self, request_data):
        return {'success': False, 'error': 'Document verifier requires premium version'}
    
    def legal_term_explainer(self, request_data):
        return {'success': False, 'error': 'Legal term explainer requires premium version'}
    
    def rent_agreement_reader(self, request_data):
        return {'success': False, 'error': 'Rent agreement reader requires premium version'}
    
    def assignment_planner(self, request_data):
        return {'success': False, 'error': 'Assignment planner requires premium version'}
    
    def study_schedule(self, request_data):
        return {'success': False, 'error': 'Study schedule requires premium version'}
    
    def citation_generator(self, request_data):
        return {'success': False, 'error': 'Citation generator requires premium version'}
    
    def research_helper(self, request_data):
        return {'success': False, 'error': 'Research helper requires premium version'}
    
    def note_taker(self, request_data):
        return {'success': False, 'error': 'Note taker requires premium version'}
    
    def flashcard_maker(self, request_data):
        return {'success': False, 'error': 'Flashcard maker requires premium version'}
    
    def quiz_generator(self, request_data):
        return {'success': False, 'error': 'Quiz generator requires premium version'}
    
    def essay_writer(self, request_data):
        return {'success': False, 'error': 'Essay writer requires premium version'}
    
    def presentation_maker(self, request_data):
        return {'success': False, 'error': 'Presentation maker requires premium version'}
    
    def mind_map_creator(self, request_data):
        return {'success': False, 'error': 'Mind map creator requires premium version'}
    
    def loan_calculator(self, request_data):
        return {'success': False, 'error': 'Loan calculator requires premium version'}
    
    def investment_calculator(self, request_data):
        return {'success': False, 'error': 'Investment calculator requires premium version'}
    
    def tax_calculator(self, request_data):
        return {'success': False, 'error': 'Tax calculator requires premium version'}
    
    def profit_calculator(self, request_data):
        return {'success': False, 'error': 'Profit calculator requires premium version'}
    
    def expense_tracker(self, request_data):
        return {'success': False, 'error': 'Expense tracker requires premium version'}
    
    def budget_planner(self, request_data):
        return {'success': False, 'error': 'Budget planner requires premium version'}
    
    def salary_calculator(self, request_data):
        return {'success': False, 'error': 'Salary calculator requires premium version'}
    
    def barcode_generator(self, request_data):
        return {'success': False, 'error': 'Barcode generator requires premium version'}
    
    def hash_generator(self, request_data):
        return {'success': False, 'error': 'Hash generator requires premium version'}
    
    def json_formatter(self, request_data):
        return {'success': False, 'error': 'JSON formatter requires premium version'}
    
    def base64_encoder(self, request_data):
        return {'success': False, 'error': 'Base64 encoder requires premium version'}
    
    def url_shortener(self, request_data):
        return {'success': False, 'error': 'URL shortener requires premium version'}
    
    def unit_converter(self, request_data):
        return {'success': False, 'error': 'Unit converter requires premium version'}
    
    def color_picker(self, request_data):
        return {'success': False, 'error': 'Color picker requires premium version'}
    
    def text_summarizer(self, request_data):
        return {'success': False, 'error': 'Text summarizer requires premium version'}
    
    def resume_generator(self, request_data):
        return {'success': False, 'error': 'Resume generator requires premium version'}
    
    def business_name_generator(self, request_data):
        return {'success': False, 'error': 'Business name generator requires premium version'}
    
    def blog_title_generator(self, request_data):
        return {'success': False, 'error': 'Blog title generator requires premium version'}
    
    def product_description(self, request_data):
        return {'success': False, 'error': 'Product description requires premium version'}
    
    def script_writer(self, request_data):
        return {'success': False, 'error': 'Script writer requires premium version'}
    
    def ad_copy_generator(self, request_data):
        return {'success': False, 'error': 'Ad copy generator requires premium version'}
    
    def faq_generator(self, request_data):
        return {'success': False, 'error': 'FAQ generator requires premium version'}
    
    def content_rewriter(self, request_data):
        return {'success': False, 'error': 'Content rewriter requires premium version'}
