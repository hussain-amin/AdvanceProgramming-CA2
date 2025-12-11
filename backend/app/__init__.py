from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
import os
from flask_jwt_extended import JWTManager



db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "supersecretjwt")
    jwt.init_app(app)
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:postgres@db:5432/pm_portal"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.secret_key = os.getenv('SECRET_KEY', 'supersecret')

    db.init_app(app)
    migrate.init_app(app, db)

    from . import models
    from .routes import main, admin, member, shared
    
    # Register all blueprints
    app.register_blueprint(main)
    app.register_blueprint(admin)
    app.register_blueprint(member)
    app.register_blueprint(shared)

    return app
