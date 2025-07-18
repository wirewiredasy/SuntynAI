import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SESSION_SECRET')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    
    # Upload configuration
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg',
        'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm',
        'mp3', 'wav', 'aac', 'flac', 'ogg',
        'txt', 'csv', 'json', 'xml', 'html', 'css', 'js'
    }
    
    # Session configuration
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Security
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None
    
    # External API Keys (from environment)
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
    CURRENCY_API_KEY = os.environ.get('CURRENCY_API_KEY')
    
    # WebSocket configuration
    SOCKETIO_ASYNC_MODE = 'threading'
    SOCKETIO_CORS_ALLOWED_ORIGINS = "*"
    
    # PWA configuration
    PWA_NAME = "Suntyn AI"
    PWA_SHORT_NAME = "Suntyn"
    PWA_DESCRIPTION = "Professional AI-powered tools platform"
    PWA_THEME_COLOR = "#3b82f6"
    PWA_BACKGROUND_COLOR = "#ffffff"
