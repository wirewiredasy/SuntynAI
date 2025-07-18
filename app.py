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

    # Simple database configuration for Replit
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        # Fix postgresql URLs for SQLAlchemy
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        app.config["SQLALCHEMY_DATABASE_URI"] = database_url
        app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
            "pool_recycle": 300,
            "pool_pre_ping": True,
        }
    else:
        # Fallback to SQLite for development
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
        'Government Documents': {
            'icon': 'shield',
            'color': 'purple',
            'tools': [
                'Aadhaar Card Tools', 'PAN Card Tools', 'Passport Tools', 'Driving License Tools',
                'Voter ID Tools', 'Birth Certificate Tools', 'Income Certificate Tools'
            ]
        },
        'Student Tools': {
            'icon': 'book',
            'color': 'indigo',
            'tools': [
                'Assignment Helper', 'Research Tools', 'Citation Generator', 'GPA Calculator',
                'Study Planner', 'Note Organizer', 'Exam Scheduler', 'Academic Calendar'
            ]
        },
        'Utility Tools': {
            'icon': 'tool',
            'color': 'gray',
            'tools': [
                'QR Code Generator', 'Barcode Generator', 'Password Generator', 'Hash Generator',
                'Base64 Encoder', 'URL Shortener', 'Color Picker', 'Random Generator'
            ]
        },
        'AI Tools': {
            'icon': 'brain',
            'color': 'pink',
            'tools': [
                'Text Summarizer', 'Content Generator', 'Resume Builder', 'Letter Writer',
                'Code Generator', 'Translation Tool', 'Grammar Checker', 'Paraphraser'
            ]
        }
    }

    # Store categories in app config
    app.config['TOOL_CATEGORIES'] = TOOL_CATEGORIES

    # Routes
    @app.route('/')
    def index():
        return render_template('index.html', categories=TOOL_CATEGORIES)

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

    @app.route('/all-tools')
    def all_tools():
        return render_template('all_tools.html', categories=TOOL_CATEGORIES)

    @app.route('/category/<category_name>')
    def category(category_name):
        if category_name not in TOOL_CATEGORIES:
            flash('Category not found', 'error')
            return redirect(url_for('index'))
        return render_template('category.html', 
                             category_name=category_name, 
                             category=TOOL_CATEGORIES[category_name])

    @app.route('/tool/<tool_name>')
    def tool_page(tool_name):
        # Find which category this tool belongs to
        tool_category = None
        for category, data in TOOL_CATEGORIES.items():
            if tool_name in data['tools']:
                tool_category = category
                break
        
        if not tool_category:
            flash('Tool not found', 'error')
            return redirect(url_for('index'))
        
        return render_template('tool_page.html', 
                             tool_name=tool_name, 
                             category=tool_category,
                             category_data=TOOL_CATEGORIES[tool_category])

    @app.route('/dashboard')
    @login_required
    def dashboard():
        from models import UserActivity, ToolHistory
        recent_activity = UserActivity.query.filter_by(user_id=current_user.id).order_by(UserActivity.timestamp.desc()).limit(10).all()
        tool_history = ToolHistory.query.filter_by(user_id=current_user.id).order_by(ToolHistory.created_at.desc()).limit(5).all()
        return render_template('dashboard.html', recent_activity=recent_activity, tool_history=tool_history)

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

    # Tool processing route
    @app.route('/process-tool', methods=['POST'])
    def process_tool():
        try:
            tool_name = request.form.get('tool_name')
            if not tool_name:
                return jsonify({'success': False, 'error': 'Tool name is required'}), 400

            # Import tool processor
            from tools.tool_processor import ToolProcessor
            processor = ToolProcessor()
            
            # Process the tool
            start_time = datetime.now()
            result = processor.process_tool(tool_name, request.files, request.form)
            processing_time = (datetime.now() - start_time).total_seconds()

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
                        history = ToolHistory(
                            user_id=current_user.id,
                            tool_name=tool_name,
                            input_filename=request.files.get('file').filename if request.files.get('file') else None,
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