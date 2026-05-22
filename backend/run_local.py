import os


os.environ.setdefault('FLASK_ENV', 'development')
os.environ.setdefault('SECRET_KEY', 'change-me')
os.environ.setdefault('DATABASE_URL', 'postgresql://root:root@localhost:5432/eduadapt_db')
os.environ.setdefault('JWT_SECRET_KEY', 'change-me-jwt')
os.environ.setdefault('UPLOAD_FOLDER', './uploads')
os.environ.setdefault('MAX_CONTENT_LENGTH', '104857600')
os.environ.setdefault('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')

from app import create_app


app = create_app()

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
