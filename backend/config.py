import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'ai-careerpilot-super-secret-key-2026-production-ready-32bytes')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-careerpilot-secret-key-2026-production-ready-32bytes')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # MySQL connection string format: mysql+pymysql://user:password@localhost:3306/db_name
    # Fallback to local SQLite database if MYSQL_URL/DATABASE_URL is not set
    MYSQL_URL = os.environ.get('MYSQL_URL') or os.environ.get('DATABASE_URL')
    
    if MYSQL_URL:
        if MYSQL_URL.startswith("mysql://"):
            MYSQL_URL = MYSQL_URL.replace("mysql://", "mysql+pymysql://", 1)
        elif MYSQL_URL.startswith("postgres://"):
            MYSQL_URL = MYSQL_URL.replace("postgres://", "postgresql://", 1)
        SQLALCHEMY_DATABASE_URI = MYSQL_URL
    else:
        # SQLite fallback for effortless local run out-of-the-box
        BASE_DIR = os.path.abspath(os.path.dirname(__file__))
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'careerpilot.db')}"
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # AI / LLM Configuration
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')
