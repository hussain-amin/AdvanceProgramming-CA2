from flask import Blueprint, jsonify
from ..models import Task, User, Comment
from flask_jwt_extended import jwt_required

shared = Blueprint('shared', __name__)


# ======================================
# ============ SHARED ROUTES ============
# ======================================

@shared.route('/tasks/<int:task_id>/comments', methods=['GET'])
@jwt_required()
def get_task_comments(task_id):
    """Get comments for a task"""
    task = Task.query.get_or_404(task_id)
    comments = Comment.query.filter_by(task_id=task_id).order_by(Comment.created_at.desc()).all()
    
    return jsonify({
        "comments": [{
            "id": c.id,
            "content": c.content,
            "created_at": c.created_at.isoformat(),
            "user_id": c.user_id,
            "user_name": User.query.get(c.user_id).name
        } for c in comments]
    })
