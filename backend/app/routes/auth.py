from flask import Blueprint, request, jsonify
from ..models import User, db
from flask_jwt_extended import create_access_token
from datetime import timedelta

main = Blueprint('main', __name__)


# ======================================
# ============ HEALTH CHECKS ============
# ======================================

@main.route('/health', methods=['GET'])
def health_check():
    """Check if backend is running"""
    return jsonify({"status": "ok", "message": "Backend is running"}), 200


@main.route('/health/db', methods=['GET'])
def health_db():
    """Check database connection"""
    try:
        # Try a simple query to test DB connection
        user_count = User.query.count()
        return jsonify({"status": "ok", "message": "Database is connected", "user_count": user_count}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Database error: {str(e)}"}), 500


# ======================================
# ============ AUTH ROUTES ==============
# ======================================

@main.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "User already exists"}), 400

    user = User(
        name=data['name'],
        email=data['email'],
        role=data.get('role', 'member')
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "User created successfully"}), 201


@main.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=8))
    return jsonify({"access_token": access_token, "role": user.role, "name": user.name, "user_id": user.id})
