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


@main.route('/profile', methods=['GET'])
def get_profile():
    """Get current user profile"""
    from flask_jwt_extended import jwt_required, get_jwt_identity
    
    jwt_required()(lambda: None)()  # This is a workaround to enforce JWT requirement
    user_id = get_jwt_identity()
    user = User.query.get_or_404(int(user_id))
    
    return jsonify({
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    })


@main.route('/profile', methods=['PUT'])
def update_profile():
    """Update user profile (name, email, password)"""
    from flask_jwt_extended import jwt_required, get_jwt_identity
    
    jwt_required()(lambda: None)()  # This is a workaround to enforce JWT requirement
    user_id = get_jwt_identity()
    user = User.query.get_or_404(int(user_id))
    
    data = request.json
    
    # If updating password, verify current password
    if data.get('new_password'):
        current_password = data.get('current_password')
        if not current_password:
            return jsonify({"msg": "Current password is required to change password"}), 400
        if not user.check_password(current_password):
            return jsonify({"msg": "Current password is incorrect"}), 401
        user.set_password(data['new_password'])
    
    # Update name if provided
    if data.get('name'):
        user.name = data['name']
    
    # Update email if provided
    if data.get('email'):
        # Check if email already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({"msg": "Email already in use"}), 400
        user.email = data['email']
    
    db.session.commit()
    return jsonify({
        "msg": "Profile updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    })
