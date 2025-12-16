from flask import Blueprint, request, jsonify, send_file
from ..models import User, Project, Task, Comment, Attachment, ActivityLog, ProjectFile, db
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename

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
        "assignee_name": User.query.get(t.assigned_to).name if t.assigned_to else None,
        "attachments_count": len(t.attachments)
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
                "assignee_name": User.query.get(t.assigned_to).name if t.assigned_to else None,
                "attachments_count": len(t.attachments)
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
            } for log in ActivityLog.query.filter_by(project_id=project.id).order_by(ActivityLog.created_at.desc()).all()]
        }
    })


@member.route('/projects/<int:project_id>/files', methods=['GET'])
@jwt_required()
def get_member_project_files(project_id):
    """Get all files for a project (member can only view if assigned)"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    project = Project.query.get_or_404(project_id)
    
    # Check if member is assigned to this project
    if user not in project.members:
        return jsonify({"msg": "Access denied"}), 403
    
    files = ProjectFile.query.filter_by(project_id=project_id).all()
    return jsonify({
        "files": [{
            "id": f.id,
            "filename": f.filename,
            "file_url": f.file_url,
            "uploaded_at": f.uploaded_at.isoformat(),
            "uploaded_by": User.query.get(f.uploaded_by).name
        } for f in files]
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
            "project_name": Project.query.get(t.project_id).name,
            "assigned_to": t.assigned_to,
            "assignee_name": User.query.get(t.assigned_to).name if t.assigned_to else None,
            "attachments_count": len(t.attachments)
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
    new_status = data.get('status', task.status)
    
    # Members cannot directly complete a task - they submit for review
    if new_status == 'completed':
        new_status = 'pending_review'
    
    task.status = new_status
    
    # Log activity with appropriate message
    if new_status == 'pending_review':
        action_msg = f"Submitted task '{task.title}' for review"
    else:
        action_msg = f"Updated task '{task.title}' status to '{task.status}'"
    
    log = ActivityLog(
        action=action_msg,
        user_id=int(user_id),
        project_id=task.project_id
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


# ======================================
# ========== FILE ROUTES ===============
# ======================================

# Ensure uploads directory exists
UPLOADS_DIR = '/app/uploads/tasks'
os.makedirs(UPLOADS_DIR, exist_ok=True)
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx', 'zip'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@member.route('/tasks/<int:task_id>/files', methods=['POST'])
@jwt_required()
def upload_task_file(task_id):
    """Upload a file to a task (member can only upload to their assigned task)"""
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"msg": "Task not found"}), 404
    
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    # Check if user is assigned to this task
    if task.assigned_to != user.id:
        return jsonify({"msg": "You are not assigned to this task"}), 403
    
    if 'file' not in request.files:
        return jsonify({"msg": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"msg": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"msg": "File type not allowed"}), 400
    
    try:
        # Save file with secure filename
        filename = secure_filename(file.filename)
        # Add timestamp to make unique
        import time
        filename = f"{int(time.time())}_{filename}"
        filepath = os.path.join(UPLOADS_DIR, filename)
        file.save(filepath)
        
        # Create database record
        attachment = Attachment(
            filename=file.filename,
            file_url=f"/uploads/tasks/{filename}",
            uploaded_by=user.id,
            task_id=task_id
        )
        db.session.add(attachment)
        
        # Log activity
        log = ActivityLog(
            action=f"Uploaded file '{file.filename}' to task '{task.title}'",
            user_id=user.id,
            project_id=task.project_id
        )
        db.session.add(log)
        db.session.commit()
        
        return jsonify({
            "msg": "File uploaded successfully",
            "file": {
                "id": attachment.id,
                "filename": attachment.filename,
                "file_url": attachment.file_url,
                "uploaded_at": attachment.uploaded_at.isoformat(),
                "uploaded_by": user.name
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error uploading file: {str(e)}"}), 500

@member.route('/tasks/<int:task_id>/files', methods=['GET'])
@jwt_required()
def get_task_files(task_id):
    """Get all files for a task (member can view if project member, admin can always view)"""
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"msg": "Task not found"}), 404
    
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    # Check if user is a member of the project or is admin
    if user.role != 'admin' and user not in task.project.members:
        return jsonify({"msg": "Access denied"}), 403
    
    files = Attachment.query.filter_by(task_id=task_id).all()
    return jsonify({
        "files": [{
            "id": f.id,
            "filename": f.filename,
            "file_url": f.file_url,
            "uploaded_at": f.uploaded_at.isoformat(),
            "uploaded_by": User.query.get(f.uploaded_by).name if f.uploaded_by else "Unknown"
        } for f in files]
    })

@member.route('/tasks/<int:task_id>/files/<int:file_id>', methods=['DELETE'])
@jwt_required()
def delete_task_file(task_id, file_id):
    """Delete a file from a task (only uploader or admin can delete)"""
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"msg": "Task not found"}), 404
    
    attachment = Attachment.query.filter_by(id=file_id, task_id=task_id).first()
    if not attachment:
        return jsonify({"msg": "File not found"}), 404
    
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    # Check if user is the uploader or admin
    if attachment.uploaded_by != user.id and user.role != 'admin':
        return jsonify({"msg": "You don't have permission to delete this file"}), 403
    
    try:
        # Delete file from filesystem
        filepath = os.path.join(UPLOADS_DIR, attachment.file_url.split('/')[-1])
        if os.path.exists(filepath):
            os.remove(filepath)
        
        # Delete database record
        db.session.delete(attachment)
        db.session.commit()
        return jsonify({"msg": "File deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error deleting file: {str(e)}"}), 500
