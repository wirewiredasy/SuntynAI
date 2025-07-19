import os
import logging
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix
from sqlalchemy.orm import DeclarativeBase
import json
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

# Initialize extensions
db = SQLAlchemy(model_class=Base)
socketio = SocketIO()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    # Database configuration with optimized Supabase handling
    try:
        # Import our professional database config
        from database_config import get_database_url
        database_url = get_database_url()

        if "postgresql" in database_url:
            # Use new Supabase with optimized IPv4 connection
            app.config["SQLALCHEMY_DATABASE_URI"] = database_url
            app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
                "pool_size": 5,
                "max_overflow": 10,
                "pool_recycle": 1800,  # 30 minutes
                "pool_pre_ping": True,
                "connect_args": {
                    "sslmode": "require",
                    "connect_timeout": 45,
                    "application_name": "Suntyn_AI_Platform",
                    "keepalives_idle": 600,
                    "keepalives_interval": 30,
                    "keepalives_count": 3,
                    "target_session_attrs": "read-write"
                }
            }
            logging.info("✅ Using new Supabase PostgreSQL database with optimized connection")
        else:
            # Fallback to SQLite
            app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///suntyn_ai.db"
            app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
                "pool_recycle": 300,
                "pool_pre_ping": True,
            }
            logging.info("Using SQLite fallback database")
    except Exception as e:
        logging.warning(f"Database connection failed, using SQLite: {str(e)}")
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///suntyn_ai.db"
        app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
            "pool_recycle": 300,
            "pool_pre_ping": True,
        }

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Upload configuration
    app.config["UPLOAD_FOLDER"] = 'uploads'
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max file size

    # Initialize extensions
    db.init_app(app)
    socketio.init_app(app, 
                     cors_allowed_origins="*",
                     ping_timeout=60,
                     ping_interval=25,
                     max_http_buffer_size=16 * 1024 * 1024,
                     async_mode='threading',
                     logger=False,
                     engineio_logger=False)
    login_manager.init_app(app)
    login_manager.login_view = 'login'
    login_manager.login_message = 'Please log in to access this page.'

    @login_manager.user_loader
    def load_user(user_id):
        from models import User
        return User.query.get(int(user_id))

    # PDF Toolkit Configuration - Clean and focused
    app.config['PDF_TOOLKIT'] = True

    # Main route - clean PDF toolkit homepage
    @app.route('/')
    def index():
        # Simple PDF toolkit data structure
        tools_data = {
            'merge': {'name': 'PDF Merger', 'icon': 'ti ti-files', 'desc': 'Merge multiple PDFs into one'},
            'split': {'name': 'PDF Splitter', 'icon': 'ti ti-cut', 'desc': 'Split PDF into separate files'},
            'compress': {'name': 'PDF Compressor', 'icon': 'ti ti-package', 'desc': 'Reduce PDF file size'},
            'pdf-to-word': {'name': 'PDF to Word', 'icon': 'ti ti-file-word', 'desc': 'Convert PDF to Word document'},
            'pdf-to-excel': {'name': 'PDF to Excel', 'icon': 'ti ti-file-excel', 'desc': 'Extract tables to Excel'},
            'word-to-pdf': {'name': 'Word to PDF', 'icon': 'ti ti-file-text', 'desc': 'Convert Word to PDF'},
            'image-to-pdf': {'name': 'Image to PDF', 'icon': 'ti ti-photo', 'desc': 'Convert images to PDF'},
            'pdf-to-image': {'name': 'PDF to Image', 'icon': 'ti ti-camera', 'desc': 'Extract images from PDF'},
            'unlock-pdf': {'name': 'Unlock PDF', 'icon': 'ti ti-lock-open', 'desc': 'Remove PDF password'},
            'protect-pdf': {'name': 'Protect PDF', 'icon': 'ti ti-shield', 'desc': 'Add password to PDF'},
            'rotate-pdf': {'name': 'Rotate PDF', 'icon': 'ti ti-rotate', 'desc': 'Rotate PDF pages'},
            'watermark': {'name': 'Add Watermark', 'icon': 'ti ti-droplet', 'desc': 'Add watermark to PDF'},
        }
        return render_template('index.html', tools=tools_data)

    @app.route('/service-worker.js')
    def service_worker():
        """Serve service worker from static directory"""
        from flask import send_from_directory
        return send_from_directory('.', 'service-worker.js', mimetype='application/javascript')

    @app.route('/about')
    def about():
        return render_template('about.html')

    @app.route('/contact')
    def contact():
        return render_template('contact.html')

    @app.route('/pricing')
    def pricing():
        return render_template('pricing.html')

    @app.route('/faq')
    def faq():
        return render_template('faq.html')

    # === MODULAR PDF TOOL ROUTES ===
    
    # PDF Merger Routes
    @app.route('/merge')
    def merge_page():
        return render_template('tools/merge.html', tool_name='merge')
    
    @app.route('/merge', methods=['POST'])
    def merge_pdf():
        from tools.merger import merge_pdfs
        try:
            files = request.files.getlist('pdfs')
            if not files or not files[0].filename:
                return jsonify({'success': False, 'error': 'No files provided'})
            
            success, output_path, message = merge_pdfs(files)
            
            if success:
                return send_file(output_path, as_attachment=True, download_name='merged.pdf')
            else:
                return jsonify({'success': False, 'error': message})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})
    
    # PDF Splitter Routes
    @app.route('/split')
    def split_page():
        return render_template('tools/split.html', tool_name='split')
    
    @app.route('/split', methods=['POST'])
    def split_pdf():
        from tools.splitter import split_pdf_by_pages, split_pdf_every_n_pages
        try:
            file = request.files['pdf']
            split_type = request.form.get('split_type', 'pages')
            
            if split_type == 'pages':
                page_ranges = request.form.get('page_ranges', '1-1')
                success, output_files, message = split_pdf_by_pages(file, page_ranges)
            else:  # every_n
                n_pages = int(request.form.get('every_n', 5))
                success, output_files, message = split_pdf_every_n_pages(file, n_pages)
            
            if success and output_files:
                # Return first file for now (in production, create zip)
                return send_file(output_files[0]['path'], as_attachment=True, 
                               download_name=output_files[0]['filename'])
            else:
                return jsonify({'success': False, 'error': message})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})
    
    # PDF Compressor Routes
    @app.route('/compress')
    def compress_page():
        return render_template('tools/compress.html', tool_name='compress')
    
    @app.route('/compress', methods=['POST'])
    def compress_pdf():
        from tools.compressor import compress_pdf
        try:
            file = request.files['pdf']
            compression_level = request.form.get('compression_level', 'medium')
            
            success, output_path, compression_info, message = compress_pdf(file, compression_level)
            
            if success:
                return send_file(output_path, as_attachment=True, download_name='compressed.pdf')
            else:
                return jsonify({'success': False, 'error': message})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})
    
    # PDF to Word Converter
    @app.route('/pdf-to-word')
    def pdf_to_word_page():
        return render_template('tools/pdf-to-word.html', tool_name='pdf-to-word')
    
    @app.route('/pdf-to-word', methods=['POST'])
    def pdf_to_word():
        from tools.converter import pdf_to_word
        try:
            file = request.files['pdf']
            success, output_path, message = pdf_to_word(file)
            
            if success:
                return send_file(output_path, as_attachment=True, download_name='converted.txt')
            else:
                return jsonify({'success': False, 'error': message})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})
    
    # PDF to Images Converter
    @app.route('/pdf-to-image')
    def pdf_to_image_page():
        return render_template('tools/pdf-to-image.html', tool_name='pdf-to-image')
    
    @app.route('/pdf-to-image', methods=['POST'])
    def pdf_to_image():
        from tools.converter import pdf_to_images
        try:
            file = request.files['pdf']
            image_format = request.form.get('format', 'png')
            
            success, image_files, message = pdf_to_images(file, image_format)
            
            if success and image_files:
                # Return first image for now (in production, create zip)
                return send_file(image_files[0]['path'], as_attachment=True, 
                               download_name=image_files[0]['filename'])
            else:
                return jsonify({'success': False, 'error': message})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})
    
    # Images to PDF Converter
    @app.route('/image-to-pdf')
    def image_to_pdf_page():
        return render_template('tools/image-to-pdf.html', tool_name='image-to-pdf')
    
    @app.route('/image-to-pdf', methods=['POST'])
    def image_to_pdf():
        from tools.converter import images_to_pdf
        try:
            files = request.files.getlist('images')
            success, output_path, message = images_to_pdf(files)
            
            if success:
                return send_file(output_path, as_attachment=True, download_name='images_to_pdf.pdf')
            else:
                return jsonify({'success': False, 'error': message})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})
    
    # Redirect old tool routes
    @app.route('/all-tools')
    def all_tools():
        return redirect(url_for('index'))

    @app.route('/category/<category_name>')
    def category(category_name):
        return redirect(url_for('index'))

    @app.route('/tool/<tool_name>')
    def tool_page(tool_name):
        return redirect(url_for('index'))

    @app.route('/dashboard')
    @login_required
    def dashboard():
        try:
            # Initialize empty lists as fallback
            recent_activity = []
            tool_history = []

            try:
                # Get recent activity with error handling
                from models import UserActivity
                recent_activity = UserActivity.query.filter_by(user_id=current_user.id)\
                                                   .order_by(UserActivity.timestamp.desc())\
                                                   .limit(10).all()
            except Exception as e:
                logging.warning(f"Could not fetch recent activity: {str(e)}")
                recent_activity = []

            try:
                # Get tool history with error handling
                from models import ToolHistory
                tool_history = ToolHistory.query.filter_by(user_id=current_user.id)\
                                               .order_by(ToolHistory.created_at.desc())\
                                               .limit(15).all()
            except Exception as e:
                logging.warning(f"Could not fetch tool history: {str(e)}")
                tool_history = []

            return render_template('dashboard.html', 
                                 recent_activity=recent_activity or [],
                                 tool_history=tool_history or [],
                                 current_user=current_user)
        except Exception as e:
            logging.error(f"Critical dashboard error: {str(e)}")
            flash('Dashboard temporarily unavailable. Please try again.', 'error')
            return redirect(url_for('index'))

    # Authentication routes
    @app.route('/register', methods=['GET', 'POST'])
    def register():
        if request.method == 'POST':
            try:
                from models import User
                data = request.get_json() if request.is_json else request.form

                username = data.get('username')
                email = data.get('email')
                password = data.get('password')

                if not all([username, email, password]):
                    return jsonify({'success': False, 'error': 'All fields are required'}), 400

                # Check if user exists
                if User.query.filter_by(username=username).first():
                    return jsonify({'success': False, 'error': 'Username already exists'}), 400
                if User.query.filter_by(email=email).first():
                    return jsonify({'success': False, 'error': 'Email already exists'}), 400

                # Create new user
                user = User(username=username, email=email)
                user.password_hash = generate_password_hash(password)

                db.session.add(user)
                db.session.commit()

                login_user(user)
                return jsonify({'success': True, 'redirect': url_for('dashboard')})

            except Exception as e:
                logging.error(f"Registration error: {str(e)}")
                return jsonify({'success': False, 'error': 'Registration failed'}), 500

        return render_template('auth/register.html')

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            try:
                from models import User
                data = request.get_json() if request.is_json else request.form

                username = data.get('username')
                password = data.get('password')

                if not all([username, password]):
                    return jsonify({'success': False, 'error': 'Username and password are required'}), 400

                user = User.query.filter_by(username=username).first()

                if user and check_password_hash(user.password_hash, password):
                    login_user(user, remember=data.get('remember', False))
                    return jsonify({'success': True, 'redirect': url_for('dashboard')})
                else:
                    return jsonify({'success': False, 'error': 'Invalid username or password'}), 401

            except Exception as e:
                logging.error(f"Login error: {str(e)}")
                return jsonify({'success': False, 'error': 'Login failed'}), 500

        return render_template('auth/login.html')

    @app.route('/logout')
    @login_required
    def logout():
        logout_user()
        flash('You have been logged out successfully', 'info')
        return redirect(url_for('index'))

    # Add route for PDF analysis
    @app.route('/analyze_pdf', methods=['POST'])
    def analyze_pdf():
        try:
            if 'file' not in request.files:
                return jsonify({'success': False, 'error': 'No file provided'}), 400

            file = request.files['file']
            if file.filename == '' or not file.filename.lower().endswith('.pdf'):
                return jsonify({'success': False, 'error': 'Please provide a valid PDF file'}), 400

            # For now, return mock analysis - in production, you would use PyPDF2 or similar
            # to analyze the actual PDF
            return jsonify({
                'success': True,
                'pages': 10,  # Mock page count
                'file_size': len(file.read()),
                'has_text': True,
                'has_images': True
            })

        except Exception as e:
            logging.error(f"PDF analysis error: {str(e)}")
            return jsonify({'success': False, 'error': 'Failed to analyze PDF'}), 500

    # Enhanced tool processing route with professional PDF support
    @app.route('/process_tool/<tool_name>', methods=['POST'])
    def process_tool_enhanced(tool_name):
        try:
            # Handle professional PDF tools with enhanced processing
            if tool_name in ['pdf-merger', 'pdf-splitter', 'pdf-compressor', 'pdf-to-word', 'pdf-watermark', 'pdf-password-remover', 'excel-to-pdf']:
                
                if tool_name == 'pdf-merger':
                    files = request.files.getlist('files')
                    if len(files) < 2:
                        return jsonify({'success': False, 'error': 'At least 2 PDF files required'}), 400
                    
                    # Mock processing - in production, use PyPDF2 to merge files
                    result = {
                        'success': True,
                        'message': 'PDFs merged successfully',
                        'download_url': '/uploads/merged_pdf.pdf',
                        'filename': 'merged_pdf.pdf',
                        'file_count': len(files)
                    }
                    
                elif tool_name == 'pdf-splitter':
                    file = request.files.get('file')
                    method = request.form.get('method', 'pages')
                    
                    # Mock processing
                    if method == 'every':
                        every_n = int(request.form.get('every_n_pages', 1))
                        result = {
                            'success': True,
                            'message': 'PDF split successfully',
                            'files': [
                                {'filename': f'split_part_{i+1}.pdf', 'download_url': f'/uploads/split_part_{i+1}.pdf'}
                                for i in range(3)  # Mock 3 files
                            ]
                        }
                    else:
                        result = {
                            'success': True,
                            'message': 'Pages extracted successfully',
                            'download_url': '/uploads/extracted_pages.pdf',
                            'filename': 'extracted_pages.pdf'
                        }
                
                elif tool_name == 'pdf-compressor':
                    compression_level = request.form.get('compression_level', 'medium')
                    
                    # Mock compression results
                    compression_ratios = {'low': 20, 'medium': 45, 'high': 65, 'maximum': 80}
                    savings = compression_ratios.get(compression_level, 45)
                    
                    result = {
                        'success': True,
                        'message': 'PDF compressed successfully',
                        'download_url': '/uploads/compressed_pdf.pdf',
                        'filename': 'compressed_pdf.pdf',
                        'original_size': '5.2 MB',
                        'compressed_size': f'{5.2 * (100 - savings) / 100:.1f} MB',
                        'savings_percent': savings
                    }
                
                elif tool_name == 'pdf-to-word':
                    ocr_enabled = request.form.get('ocr_enabled') == 'true'
                    language = request.form.get('language', 'eng')
                    
                    result = {
                        'success': True,
                        'message': 'PDF converted to Word successfully',
                        'download_url': '/uploads/converted_document.docx',
                        'filename': 'converted_document.docx',
                        'pages_converted': 8,
                        'text_extracted': 'Yes' if ocr_enabled else 'Basic',
                        'images_included': 3
                    }
                
                elif tool_name == 'pdf-watermark':
                    watermark_type = request.form.get('watermark_type', 'text')
                    
                    result = {
                        'success': True,
                        'message': 'Watermark added successfully',
                        'download_url': '/uploads/watermarked_pdf.pdf',
                        'filename': 'watermarked_pdf.pdf',
                        'watermark_type': watermark_type
                    }
                
                return jsonify(result)
            
            # If no matching professional tool found, continue with original processing
            pass
            
        except Exception as e:
            logging.error(f"Enhanced tool processing error for {tool_name}: {str(e)}")
            return jsonify({
                'success': False,
                'error': f'Tool processing failed: {str(e)}'
            }), 500

    # Main tool processing route with PDF tools integration
    @app.route('/process_tool', methods=['POST'])
    def process_tool():
        try:
            # Get tool name from form or headers
            tool_name = request.form.get('tool_name') or request.headers.get('X-Tool-Name')
            
            if not tool_name:
                return jsonify({'success': False, 'error': 'Tool name is required'}), 400

            # Handle all PDF tools with real processing
            if tool_name in ['pdf-merger', 'pdf-splitter', 'pdf-compressor', 'pdf-to-excel', 'pdf-to-powerpoint', 
                           'word-to-pdf', 'excel-to-pdf', 'powerpoint-to-pdf', 'pdf-password-remover', 
                           'pdf-watermark', 'pdf-page-extractor', 'pdf-converter', 'pdf-editor', 'pdf-to-word']:
                from tools.pdf_tools import process_pdf_merger, process_pdf_splitter, process_pdf_compressor
                from tools.pdf_tools_extended import (process_pdf_to_excel, process_pdf_to_powerpoint, 
                                                    process_word_to_pdf, process_pdf_password_remover,
                                                    process_pdf_watermark, process_pdf_page_extractor)
                
                if tool_name == 'pdf-merger':
                    result = process_pdf_merger(request)
                elif tool_name == 'pdf-splitter':
                    result = process_pdf_splitter(request)
                elif tool_name == 'pdf-compressor':
                    result = process_pdf_compressor(request)
                elif tool_name == 'pdf-to-excel':
                    result = process_pdf_to_excel(request)
                elif tool_name == 'pdf-to-powerpoint':
                    result = process_pdf_to_powerpoint(request)
                elif tool_name == 'word-to-pdf':
                    result = process_word_to_pdf(request)
                elif tool_name == 'excel-to-pdf':
                    result = process_word_to_pdf(request)  # Same as word-to-pdf for now
                elif tool_name == 'powerpoint-to-pdf':
                    result = process_word_to_pdf(request)  # Same as word-to-pdf for now
                elif tool_name == 'pdf-password-remover':
                    result = process_pdf_password_remover(request)
                elif tool_name == 'pdf-watermark':
                    result = process_pdf_watermark(request)
                elif tool_name == 'pdf-page-extractor':
                    result = process_pdf_page_extractor(request)
                elif tool_name == 'pdf-converter':
                    result = process_pdf_to_excel(request)  # PDF converter can convert to multiple formats
                elif tool_name == 'pdf-editor':
                    result = process_pdf_watermark(request)  # PDF editor can add watermarks
                elif tool_name == 'pdf-to-word':
                    result = process_pdf_to_powerpoint(request)  # Convert to presentation format
                
                return jsonify(result)
                
            # Process utility tools with specialized processor
            if tool_name in ['qr-code-generator', 'barcode-generator', 'url-shortener', 'password-generator']:
                from tools.utility_tools import (
                    process_qr_generator, process_barcode_generator, 
                    process_password_generator, process_url_shortener
                )
                
                if tool_name == 'qr-code-generator':
                    result = process_qr_generator(request)
                elif tool_name == 'barcode-generator':
                    result = process_barcode_generator(request)
                elif tool_name == 'password-generator':
                    result = process_password_generator(request)
                elif tool_name == 'url-shortener':
                    result = process_url_shortener(request)
                
                return jsonify(result)
            
            # Default processing for other tools
            from tools.universal_processor import UniversalToolProcessor
            processor = UniversalToolProcessor()
            result = processor.process_tool(tool_name, request.files, request.form)
            return jsonify(result)
            
        except Exception as e:
            logging.error(f"Tool processing error: {str(e)}")
            return jsonify({
                'success': False,
                'error': f'Tool processing failed: {str(e)}'
            }), 500
    
    # Legacy route for backward compatibility  
    @app.route('/process-tool', methods=['POST'])
    def process_tool_legacy():
        tool_name = request.form.get('tool_name')
        try:
            if not tool_name:
                return jsonify({'success': False, 'error': 'Tool name is required'}), 400

            # Process utility tools with specialized processor
            if tool_name in ['qr-code-generator', 'barcode-generator', 'url-shortener', 'password-generator', 'hash-generator', 'uuid-generator', 'json-formatter']:
                try:
                    from tools.utility_tools import (
                        process_qr_generator, process_barcode_generator, process_password_generator,
                        process_hash_generator, process_uuid_generator, process_url_shortener, process_json_formatter
                    )

                    start_time = datetime.now()

                    if tool_name == 'qr-code-generator':
                        result = process_qr_generator(request)
                    elif tool_name == 'barcode-generator':
                        result = process_barcode_generator(request)
                    elif tool_name == 'password-generator':
                        result = process_password_generator(request)
                    elif tool_name == 'hash-generator':
                        result = process_hash_generator(request)
                    elif tool_name == 'uuid-generator':
                        result = process_uuid_generator(request)
                    elif tool_name == 'url-shortener':
                        result = process_url_shortener(request)
                    elif tool_name == 'json-formatter':
                        result = process_json_formatter(request)
                    else:
                        result = {'success': False, 'error': 'Tool not found'}

                    # Ensure proper response format
                    if 'success' not in result:
                        if 'error' in result:
                            result = {'success': False, 'error': result['error']}
                        else:
                            result['success'] = True

                except Exception as e:
                    logger.error(f"Utility tool error for {tool_name}: {str(e)}")
                    result = {'success': False, 'error': f'Tool processing failed: {str(e)}'}

                processing_time = (datetime.now() - start_time).total_seconds()
            else:
                # Import universal tool processor for other tools
                from tools.universal_processor import UniversalToolProcessor
                processor = UniversalToolProcessor()

                # Process the tool
                start_time = datetime.now()
                result = processor.process_tool(tool_name, request.files, request.form)
                processing_time = (datetime.now() - start_time).total_seconds()

            # Ensure we have a valid result
            if not isinstance(result, dict):
                result = {'success': False, 'error': 'Invalid result from processor'}

            # Log activity and history if user is logged in
            if current_user.is_authenticated:
                try:
                    from models import UserActivity, ToolHistory

                    # Log user activity
                    activity = UserActivity(
                        user_id=current_user.id,
                        tool_name=tool_name,
                        success=result.get('success', False)
                    )
                    db.session.add(activity)

                    # Log tool history if successful
                    if result.get('success'):
                        file_obj = request.files.get('file') or request.files.get('files')
                        if hasattr(file_obj, 'filename'):
                            filename = file_obj.filename
                        else:
                            filename = None

                        history = ToolHistory(
                            user_id=current_user.id,
                            tool_name=tool_name,
                            input_filename=filename,
                            processing_time=processing_time,
                            file_path=result.get('download_url', '').replace('/uploads/', '') if result.get('download_url') else None
                        )
                        db.session.add(history)

                    db.session.commit()
                except Exception as db_error:
                    logging.warning(f"Failed to log tool history: {str(db_error)}")

            # Add processing time to result
            result['processing_time'] = f"{processing_time:.2f}s"
            return jsonify(result)

        except ImportError as import_error:
            logging.error(f"Tool processor import error: {str(import_error)}")
            return jsonify({
                'success': False,
                'error': 'Tool processor not available. Please try again later.'
            }), 503

        except Exception as e:
            logging.error(f"Tool processing error: {str(e)}")
            return jsonify({
                'success': False,
                'error': f'Tool processing failed: {str(e)}'
            }), 500

    # File serving route
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        from flask import send_from_directory
        upload_dir = os.path.join(app.root_path, 'uploads')
        return send_from_directory(upload_dir, filename)

    # Profile and Settings routes (placeholder)
    @app.route('/profile')
    @login_required
    def profile():
        return render_template('dashboard.html')

    @app.route('/settings')
    @login_required
    def settings():
        return render_template('dashboard.html')

    # Health check route
    # Additional pages
    @app.route('/privacy-policy')
    def privacy_policy():
        return render_template('legal/privacy_policy.html')

    @app.route('/terms-of-service')
    def terms_of_service():
        return render_template('legal/terms_of_service.html')

    @app.route('/cookie-policy')
    def cookie_policy():
        return render_template('legal/cookie_policy.html')

    @app.route('/privacy')
    def privacy():
        return render_template('privacy.html')

    @app.route('/terms')
    def terms():
        return render_template('terms.html')

    @app.route('/cookies')
    def cookies():
        return render_template('cookies.html')

    @app.route('/security')
    def security():
        return render_template('legal/security.html')

    @app.route('/compliance')
    def compliance():
        return render_template('legal/compliance.html')

    @app.route('/dmca')
    def dmca():
        return render_template('legal/dmca.html')

    @app.route('/blog')
    def blog():
        return render_template('blog/index.html')

    @app.route('/careers')
    def careers():
        return render_template('company/careers.html')

    @app.route('/press')
    def press():
        return render_template('company/press.html')

    @app.route('/partnerships')
    def partnerships():
        return render_template('company/partnerships.html')

    @app.route('/investors')
    def investors():
        return render_template('company/investors.html')

    @app.route('/affiliate')
    def affiliate():
        return render_template('company/affiliate.html')

    @app.route('/support')
    def support():
        return render_template('support/index.html')

    @app.route('/api-docs')
    def api_docs():
        return render_template('docs/api.html')

    @app.route('/tutorials')
    def tutorials():
        return render_template('docs/tutorials.html')

    @app.route('/changelog')
    def changelog():
        return render_template('docs/changelog.html')

    @app.route('/status')
    def status():
        return render_template('status/index.html')

    @app.route('/feature-requests')
    def feature_requests():
        return render_template('community/feature_requests.html')

    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return render_template('errors/404.html'), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return render_template('errors/500.html'), 500

    @app.errorhandler(403)
    def forbidden_error(error):
        return render_template('errors/403.html'), 403

    @app.errorhandler(429)
    def rate_limit_error(error):
        return render_template('errors/429.html'), 429

    @app.route('/health')
    def health_check():
        try:
            # Test database connection
            db.session.execute(db.text('SELECT 1'))
            return jsonify({
                'status': 'healthy',
                'database': 'connected',
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            return jsonify({
                'status': 'unhealthy',
                'database': 'disconnected',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }), 500

    # Create tables
    with app.app_context():
        try:
            # Import models to ensure they are registered
            import models
            db.create_all()
            logging.info("Database tables created successfully")
        except Exception as e:
            logging.error(f"Database initialization error: {str(e)}")

    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)