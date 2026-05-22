import os
import sys

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from config import DevelopmentConfig, ProductionConfig
from extensions import db, migrate, jwt


def create_app():
    load_dotenv()

    app = Flask(__name__)
    env = os.getenv('FLASK_ENV', 'development')
    config_cls = ProductionConfig if env == 'production' else DevelopmentConfig
    app.config.from_object(config_cls)

    if not app.config.get('SQLALCHEMY_DATABASE_URI'):
        raise RuntimeError('DATABASE_URL is required')

    app.config['ML_PATH'] = os.path.abspath(app.config.get('ML_PATH'))
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    db.init_app(app)
    import models.db_models  # ensure models are registered for migrations
    migrate.init_app(app, db)
    jwt.init_app(app)

    origins = app.config.get('CORS_ORIGINS', [])
    if isinstance(origins, str):
        origins = [o.strip() for o in origins.split(',') if o.strip()]

    CORS(
        app,
        origins=origins,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    from blueprints.auth import auth_bp
    from blueprints.student import student_bp
    from blueprints.educator import educator_bp
    from blueprints.admin import admin_bp
    from blueprints.api import api_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(student_bp, url_prefix='/student')
    app.register_blueprint(educator_bp, url_prefix='/educator')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(api_bp, url_prefix='/api')

    from services.ml_service import MLService
    app.extensions['ml_service'] = MLService(app.config['ML_PATH'])

    @app.get('/health')
    def health():
        return {'status': 'ok'}

    return app
