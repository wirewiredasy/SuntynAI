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
from config import Config

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
    app.config.from_object(Config)
    app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
    
    # Initialize extensions
    db.init_app(app)
    socketio.init_app(app, 
                     cors_allowed_origins="*",
                     ping_timeout=60,
                     ping_interval=25,
                     max_http_buffer_size=16 * 1024 * 1024,  # 16MB
                     async_mode='threading',
                     logger=False,
                     engineio_logger=False)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    
    # Import models and socket events
    from models import User, Tool, UserActivity, ToolHistory
    # from socket_events import register_socket_events
    
    # Register socket events (disabled for stability)
    # register_socket_events(socketio)
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Tool categories configuration
    TOOL_CATEGORIES = {
        'PDF Tools': {
            'icon': 'file-text',
            'color': 'red',
            'tools': [
                'PDF Merger', 'PDF Splitter', 'PDF Compressor', 'PDF to Word',
                'PDF to Excel', 'PDF to PowerPoint', 'Word to PDF', 'Excel to PDF',
                'PowerPoint to PDF', 'PDF Password Remover', 'PDF Watermark',
                'PDF Page Extractor', 'PDF Converter', 'PDF Editor'
            ]
        },
        'Image Tools': {
            'icon': 'image',
            'color': 'blue',
            'tools': [
                'Image Compressor', 'Image Resizer', 'Image Converter', 'Background Remover',
                'Image Cropper', 'Image Enhancer', 'Watermark Remover', 'Meme Generator',
                'Image Filter', 'Photo Editor', 'Collage Maker', 'Image Optimizer'
            ]
        },
        'Video/Audio Tools': {
            'icon': 'play-circle',
            'color': 'green',
            'tools': [
                'Video Compressor', 'Video Converter', 'Audio Converter', 'Video Trimmer',
                'Audio Trimmer', 'Video Merger', 'Audio Merger', 'Video to Audio',
                'Audio to Video', 'Video Editor', 'Audio Editor', 'Screen Recorder'
            ]
        },
        'Finance Tools': {
            'icon': 'dollar-sign',
            'color': 'yellow',
            'tools': [
                'EMI Calculator', 'GST Calculator', 'Currency Converter', 'Loan Calculator',
                'Investment Calculator', 'Tax Calculator', 'Profit Calculator',
                'Expense Tracker', 'Budget Planner', 'Salary Calculator'
            ]
        },
        'Utility Tools': {
            'icon': 'tool',
            'color': 'purple',
            'tools': [
                'QR Code Generator', 'Barcode Generator', 'Password Generator', 'URL Shortener',
                'Text Case Converter', 'JSON Formatter', 'XML Formatter', 'Base64 Encoder',
                'Hash Generator', 'Unit Converter', 'Color Picker', 'UUID Generator'
            ]
        },
        'AI Tools': {
            'icon': 'brain',
            'color': 'pink',
            'tools': [
                'Text Summarizer', 'Resume Generator', 'Business Name Generator',
                'Blog Title Generator', 'Product Description', 'Script Writer',
                'Ad Copy Generator', 'FAQ Generator', 'Content Rewriter',
                'Grammar Checker', 'Plagiarism Checker', 'Keyword Extractor'
            ]
        },
        'Student Tools': {
            'icon': 'book',
            'color': 'indigo',
            'tools': [
                'Assignment Planner', 'Study Schedule', 'GPA Calculator', 'Citation Generator',
                'Research Helper', 'Note Taker', 'Flashcard Maker', 'Quiz Generator',
                'Essay Writer', 'Presentation Maker', 'Mind Map Creator'
            ]
        },
        'Government Tools': {
            'icon': 'shield',
            'color': 'gray',
            'tools': [
                'Aadhaar Validator', 'PAN Validator', 'GST Validator', 'Passport Checker',
                'Voter ID Checker', 'Driving License Checker', 'Ration Card Reader',
                'Document Verifier', 'Legal Term Explainer', 'Rent Agreement Reader'
            ]
        }
    }
    
    # Routes
    @app.route('/')
    def index():
        recent_tools = []
        most_used_tools = []
        
        if current_user.is_authenticated:
            # Get recent tools for logged-in user
            recent_activities = UserActivity.query.filter_by(user_id=current_user.id)\
                .order_by(UserActivity.created_at.desc()).limit(6).all()
            recent_tools = [activity.tool_name for activity in recent_activities]
            
            # Get most used tools
            from sqlalchemy import func
            most_used = db.session.query(
                UserActivity.tool_name, 
                func.count(UserActivity.id).label('count')
            ).filter_by(user_id=current_user.id)\
             .group_by(UserActivity.tool_name)\
             .order_by(func.count(UserActivity.id).desc())\
             .limit(6).all()
            most_used_tools = [tool[0] for tool in most_used]
        
        return render_template('index.html', 
                             categories=TOOL_CATEGORIES,
                             recent_tools=recent_tools,
                             most_used_tools=most_used_tools)
    
    @app.route('/dashboard')
    @login_required
    def dashboard():
        user_activities = UserActivity.query.filter_by(user_id=current_user.id)\
            .order_by(UserActivity.created_at.desc()).limit(20).all()
        
        tool_history = ToolHistory.query.filter_by(user_id=current_user.id)\
            .order_by(ToolHistory.created_at.desc()).limit(10).all()
        
        return render_template('dashboard.html',
                             activities=user_activities,
                             history=tool_history)
    
    @app.route('/pricing')
    def pricing():
        return render_template('pricing.html')
    
    @app.route('/about')
    def about():
        return render_template('about.html')
    
    @app.route('/contact')
    def contact():
        return render_template('contact.html')
    
    @app.route('/faq')
    def faq():
        return render_template('faq.html')
    
    @app.route('/privacy')
    def privacy():
        return render_template('privacy.html')
    
    @app.route('/terms')
    def terms():
        return render_template('terms.html')
    
    @app.route('/blog')
    def blog():
        return render_template('blog.html')
    
    @app.route('/all-tools')
    def all_tools():
        return render_template('all_tools.html', categories=TOOL_CATEGORIES)
    
    # Tool category routes
    @app.route('/pdf-tools')
    def pdf_tools():
        return render_template('category.html', 
                             category='PDF Tools',
                             tools=TOOL_CATEGORIES['PDF Tools']['tools'])
    
    @app.route('/image-tools')
    def image_tools():
        return render_template('category.html', 
                             category='Image Tools',
                             tools=TOOL_CATEGORIES['Image Tools']['tools'])
    
    @app.route('/finance-tools')
    def finance_tools():
        return render_template('category.html', 
                             category='Finance Tools',
                             tools=TOOL_CATEGORIES['Finance Tools']['tools'])
    
    @app.route('/ai-tools')
    def ai_tools():
        return render_template('category.html', 
                             category='AI Tools',
                             tools=TOOL_CATEGORIES['AI Tools']['tools'])
    
    @app.route('/video-tools')
    def video_tools():
        return render_template('category.html', 
                             category='Video/Audio Tools',
                             tools=TOOL_CATEGORIES['Video/Audio Tools']['tools'])
    
    @app.route('/dev-tools')
    def dev_tools():
        return render_template('category.html', 
                             category='Utility Tools',
                             tools=TOOL_CATEGORIES['Utility Tools']['tools'])
    
    @app.route('/text-tools')
    def text_tools():
        return render_template('category.html', 
                             category='Utility Tools',
                             tools=TOOL_CATEGORIES['Utility Tools']['tools'])
    
    @app.route('/student-tools')
    def student_tools():
        return render_template('category.html', 
                             category='Student Tools',
                             tools=TOOL_CATEGORIES['Student Tools']['tools'])
    
    @app.route('/government-tools')
    def government_tools():
        return render_template('category.html', 
                             category='Government Tools',
                             tools=TOOL_CATEGORIES['Government Tools']['tools'])

    @app.route('/utility-tools')
    def utility_tools():
        return render_template('category.html', 
                             category='Utility Tools',
                             tools=TOOL_CATEGORIES['Utility Tools']['tools'])
    
    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            
            user = User.query.filter_by(username=username).first()
            
            if user and check_password_hash(user.password_hash, password):
                login_user(user)
                return redirect(url_for('index'))
            else:
                flash('Invalid username or password')
        
        return render_template('auth/login.html')
    
    @app.route('/signup', methods=['GET', 'POST'])
    def signup():
        if request.method == 'POST':
            username = request.form.get('username')
            email = request.form.get('email')
            password = request.form.get('password')
            
            if User.query.filter_by(username=username).first():
                flash('Username already exists')
                return render_template('auth/signup.html')
            
            if User.query.filter_by(email=email).first():
                flash('Email already exists')
                return render_template('auth/signup.html')
            
            user = User(
                username=username,
                email=email,
                password_hash=generate_password_hash(password)
            )
            
            db.session.add(user)
            db.session.commit()
            
            login_user(user)
            return redirect(url_for('index'))
        
        return render_template('auth/signup.html')
    
    @app.route('/logout')
    @login_required
    def logout():
        logout_user()
        return redirect(url_for('index'))
    
    # Tool routes
    @app.route('/tools/<tool_name>')
    def tool_page(tool_name):
        # Log tool access
        if current_user.is_authenticated:
            activity = UserActivity(
                user_id=current_user.id,
                tool_name=tool_name,
                action='accessed'
            )
            db.session.add(activity)
            db.session.commit()
        
        # Find which category this tool belongs to
        tool_category = None
        tool_info = None
        for category, info in TOOL_CATEGORIES.items():
            tool_display_name = tool_name.replace('-', ' ').title()
            if tool_display_name in info['tools']:
                tool_category = category
                tool_info = info
                break
        
        return render_template('tool_page.html', 
                             tool_name=tool_name,
                             tool_display_name=tool_name.replace('-', ' ').title(),
                             tool_category=tool_category,
                             tool_info=tool_info)
    
    @app.route('/api/process-tool/<tool_name>', methods=['POST'])
    def process_tool_api(tool_name):
        """API endpoint to process tools"""
        try:
            from tools.tool_processor import ToolProcessor
            processor = ToolProcessor()
            
            # Record start time for performance tracking
            start_time = datetime.now()
            
            # Process the tool
            result = processor.process_tool(tool_name, request)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Log tool usage if user is authenticated
            if current_user.is_authenticated and result.get('success'):
                try:
                    history = ToolHistory(
                        user_id=current_user.id,
                        tool_name=tool_name,
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
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
