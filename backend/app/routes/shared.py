from flask import Blueprint, jsonify, request
from ..models import Task, User, Comment, Notification, db
from flask_jwt_extended import jwt_required, get_jwt_identity

shared = Blueprint('shared', __name__)


# ======================================
# ========= HELPER FUNCTIONS ============
# ======================================

def create_notification(user_id, message, notification_type, task_project_id=None, task_number=None, project_id=None, triggered_by=None):
    """Helper function to create a notification"""
    notification = Notification(
        user_id=user_id,
        message=message,
        type=notification_type,
        task_project_id=task_project_id,
        task_number=task_number,
        project_id=project_id,
        triggered_by=triggered_by
    )
    db.session.add(notification)
    return notification


def notify_admins(message, notification_type, task_project_id=None, task_number=None, project_id=None, triggered_by=None):
    """Send notification to all admins"""
    admins = User.query.filter_by(role='admin').all()
    for admin in admins:
        create_notification(admin.id, message, notification_type, task_project_id, task_number, project_id, triggered_by)


def notify_project_members(project_id, message, notification_type, task_project_id=None, task_number=None, triggered_by=None, exclude_user_id=None):
    """Send notification to all members of a project"""
    from ..models import Project
    project = Project.query.get(project_id)
    if project:
        for member in project.members:
            if exclude_user_id and member.id == exclude_user_id:
                continue
            create_notification(member.id, message, notification_type, task_project_id, task_number, project_id, triggered_by)


# ======================================
# ======== NOTIFICATION ROUTES ==========
# ======================================

@shared.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get all notifications for the current user"""
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=int(user_id)).order_by(Notification.created_at.desc()).limit(50).all()
    
    return jsonify({
        "notifications": [{
            "id": n.id,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
            "task_project_id": n.task_project_id,
            "task_number": n.task_number,
            "project_id": n.project_id,
            "triggered_by_name": User.query.get(n.triggered_by).name if n.triggered_by else None
        } for n in notifications]
    })


@shared.route('/notifications/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Get count of unread notifications"""
    user_id = get_jwt_identity()
    count = Notification.query.filter_by(user_id=int(user_id), is_read=False).count()
    return jsonify({"count": count})


@shared.route('/notifications/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(notification_id):
    """Mark a single notification as read"""
    user_id = get_jwt_identity()
    notification = Notification.query.filter_by(id=notification_id, user_id=int(user_id)).first_or_404()
    notification.is_read = True
    db.session.commit()
    return jsonify({"msg": "Notification marked as read"})


@shared.route('/notifications/read-all', methods=['PUT'])
@jwt_required()
def mark_all_as_read():
    """Mark all notifications as read"""
    user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=int(user_id), is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"msg": "All notifications marked as read"})


# ======================================
# ============ SHARED ROUTES ============
# ======================================

@shared.route('/projects/<int:project_id>/tasks/<int:task_number>/comments', methods=['GET'])
@jwt_required()
def get_task_comments(project_id, task_number):
    """Get comments for a task"""
    task = Task.query.get_or_404((project_id, task_number))
    comments = Comment.query.filter_by(task_project_id=project_id, task_number=task_number).order_by(Comment.created_at.desc()).all()
    
    return jsonify({
        "comments": [{
            "id": c.id,
            "content": c.content,
            "created_at": c.created_at.isoformat(),
            "user_id": c.user_id,
            "user_name": User.query.get(c.user_id).name
        } for c in comments]
    })
