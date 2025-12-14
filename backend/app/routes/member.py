from flask import Blueprint, request, jsonify
from ..models import User, Project, Task, Comment, Attachment, ActivityLog, db
from flask_jwt_extended import jwt_required, get_jwt_identity

member = Blueprint('member', __name__, url_prefix='/member')


# ======================================
# ============ PROJECT ROUTES ===========
# ======================================

@member.route('/projects', methods=['GET'])
@jwt_required()
def member_projects():
    """Get projects assigned to the member"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    projects = [{
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "start_date": p.start_date.isoformat() if p.start_date else None,
        "due_date": p.due_date.isoformat() if p.due_date else None,
        "completion_date": p.completion_date.isoformat() if p.completion_date else None,
        "priority": p.priority
    } for p in user.projects]
    return jsonify(projects)


@member.route('/projects/<int:project_id>/tasks', methods=['GET'])
@jwt_required()
def project_tasks(project_id):
    """Get tasks for a project (member can only see if assigned)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    project = Project.query.get_or_404(project_id)
    if user not in project.members:
        return jsonify({"msg": "Access denied"}), 403
    
    tasks = [{
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "status": t.status,
        "priority": t.priority,
        "start_date": t.start_date.isoformat() if t.start_date else None,
        "due_date": t.due_date.isoformat() if t.due_date else None,
        "completion_date": t.completion_date.isoformat() if t.completion_date else None,
        "assigned_to": t.assigned_to,
        "assignee_name": User.query.get(t.assigned_to).name if t.assigned_to else None
    } for t in project.tasks]
    return jsonify(tasks)


@member.route('/projects/<int:project_id>', methods=['GET'])
@jwt_required()
def get_member_project_details(project_id):
    """Get full project details (member can only see if assigned)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    project = Project.query.get_or_404(project_id)
    
    # Check if member is assigned to this project
    if user not in project.members:
        return jsonify({"msg": "Access denied"}), 403
    
    return jsonify({
        "project": {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "start_date": project.start_date.isoformat() if project.start_date else None,
            "due_date": project.due_date.isoformat() if project.due_date else None,
            "completion_date": project.completion_date.isoformat() if project.completion_date else None,
            "priority": project.priority,
            "created_at": project.created_at.isoformat(),
            "tasks": [{
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "status": t.status,
                "priority": t.priority,
                "start_date": t.start_date.isoformat() if t.start_date else None,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "completion_date": t.completion_date.isoformat() if t.completion_date else None,
                "assigned_to": t.assigned_to,
                "assignee_name": User.query.get(t.assigned_to).name if t.assigned_to else None
            } for t in project.tasks],
            "members": [{
                "id": m.id,
                "name": m.name,
                "email": m.email
            } for m in project.members],
            "activity_logs": [{
                "id": log.id,
                "action": log.action,
                "user_name": User.query.get(log.user_id).name,
                "created_at": log.created_at.isoformat()
            } for log in ActivityLog.query.filter_by(user_id=project.id).all()]
        }
    })


# ======================================
# ============ TASK ROUTES ==============
# ======================================

@member.route('/tasks', methods=['GET'])
@jwt_required()
def get_my_tasks():
    """Get all tasks assigned to the member"""
    user_id = get_jwt_identity()
    
    query = Task.query.filter_by(assigned_to=int(user_id))
    
    # Filter by status if provided
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)
    
    # Filter by priority if provided
    priority = request.args.get('priority')
    if priority:
        query = query.filter_by(priority=priority)
    
    tasks = query.all()
    
    return jsonify({
        "tasks": [{
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "priority": t.priority,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "project_id": t.project_id,
            "project_name": Project.query.get(t.project_id).name
        } for t in tasks]
    })


@member.route('/tasks/<int:task_id>/status', methods=['PUT'])
@jwt_required()
def update_task_status(task_id):
    """Update task status (member can only update assigned tasks)"""
    user_id = get_jwt_identity()
    task = Task.query.get_or_404(task_id)
    if task.assigned_to != int(user_id):
        return jsonify({"msg": "Not authorized"}), 403
    
    data = request.json
    task.status = data.get('status', task.status)
    
    # Auto-record completion_date when task is marked as completed
    if task.status == 'completed':
        from datetime import datetime
        task.completion_date = datetime.utcnow()
    
    # Log activity
    log = ActivityLog(
        action=f"Updated task '{task.title}' status to '{task.status}'",
        user_id=int(user_id)
    )
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"msg": "Task status updated"})


# ======================================
# ============ COMMENT ROUTES ===========
# ======================================

@member.route('/tasks/<int:task_id>/comment', methods=['POST'])
@jwt_required()
def add_comment(task_id):
    """Add a comment to a task"""
    data = request.json
    user_id = get_jwt_identity()
    task = Task.query.get_or_404(task_id)
    
    comment = Comment(
        content=data['content'],
        task_id=task.id,
        user_id=int(user_id)
    )
    db.session.add(comment)
    
    # Log activity
    log = ActivityLog(
        action=f"Added comment to task '{task.title}'",
        user_id=int(user_id)
    )
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"msg": "Comment added"})


# ======================================
# ============ ATTACHMENT ROUTES ========
# ======================================

@member.route('/tasks/<int:task_id>/attachment', methods=['POST'])
@jwt_required()
def add_attachment(task_id):
    """Add an attachment to a task"""
    data = request.json
    user_id = get_jwt_identity()
    task = Task.query.get_or_404(task_id)
    attachment = Attachment(
        filename=data['filename'],
        file_url=data['file_url'],
        task_id=task.id
    )
    db.session.add(attachment)
    db.session.commit()
    return jsonify({"msg": "Attachment added"})
