from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from flask_jwt_extended import JWTManager



db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__, static_folder='/app/uploads', static_url_path='/uploads')
    CORS(app)

    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "supersecretjwt")
    jwt.init_app(app)
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:postgres@db:5432/pm_portal"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.secret_key = os.getenv('SECRET_KEY', 'supersecret')

    db.init_app(app)

    from . import models
    from .routes import main, admin, member, shared
    from .routes.db import db_routes
    
    # Register all blueprints
    app.register_blueprint(main)
    app.register_blueprint(admin)
    app.register_blueprint(member)
    app.register_blueprint(shared)
    app.register_blueprint(db_routes)
    
    # Ensure upload directories exist
    os.makedirs('/app/uploads/projects', exist_ok=True)
    os.makedirs('/app/uploads/tasks', exist_ok=True)
    
    # Create all database tables from models
    with app.app_context():
        db.create_all()

    return app
