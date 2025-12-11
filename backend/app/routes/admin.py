from flask import Blueprint, request, jsonify
from ..models import User, Project, Task, ActivityLog, db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from functools import wraps

admin = Blueprint('admin', __name__, url_prefix='/admin')

# Helper to check admin role
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role != 'admin':
            return jsonify({"msg": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper


# ======================================
# ============ PROJECT ROUTES ===========
# ======================================

@admin.route('/projects', methods=['GET'])
@jwt_required()
@admin_required
def get_projects():
    """Get all projects"""
    projects = Project.query.all()
    return jsonify({"projects": [{
        "id": p.id,
        "title": p.name,
        "description": p.description,
        "deadline": p.deadline,
        "priority": p.priority
    } for p in projects]})


@admin.route('/projects', methods=['POST'])
@jwt_required()
@admin_required
def create_project():
    """Create a new project"""
    data = request.json
    project = Project(
        name=data['name'],
        description=data.get('description'),
        deadline=datetime.fromisoformat(data['deadline']) if data.get('deadline') else None,
        priority=data.get('priority', 'Medium')
    )
    db.session.add(project)
    db.session.commit()
    return jsonify({"msg": "Project created", "project_id": project.id})


@admin.route('/projects/<int:project_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_project_details(project_id):
    """Get single project with full details (tasks, members, activity logs)"""
    project = Project.query.get_or_404(project_id)
    return jsonify({
        "project": {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "deadline": project.deadline.isoformat() if project.deadline else None,
            "priority": project.priority,
            "created_at": project.created_at.isoformat(),
            "tasks": [{
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "status": t.status,
                "priority": t.priority,
                "due_date": t.due_date.isoformat() if t.due_date else None,
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


@admin.route('/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
@admin_required
def edit_project(project_id):
    """Edit a project"""
    project = Project.query.get_or_404(project_id)
    data = request.json
    project.name = data.get('name', project.name)
    project.description = data.get('description', project.description)
    project.deadline = datetime.fromisoformat(data['deadline']) if data.get('deadline') else project.deadline
    project.priority = data.get('priority', project.priority)
    db.session.commit()
    return jsonify({"msg": "Project updated"})


@admin.route('/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_project(project_id):
    """Delete a project"""
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({"msg": "Project deleted"})


@admin.route('/projects/<int:project_id>/members', methods=['PUT'])
@jwt_required()
@admin_required
def update_project_members(project_id):
    """Update project members"""
    data = request.json
    project = Project.query.get_or_404(project_id)
    
    # Expects a list of user IDs
    member_ids = data.get('member_ids', [])
    
    # Clear existing members
    project.members.clear()
    
    # Add new members
    new_members = User.query.filter(User.id.in_(member_ids)).all()
    for user in new_members:
        project.members.append(user)
        
    # Log activity
    user_id = get_jwt_identity()
    log = ActivityLog(
        action=f"Updated members for project '{project.name}'. Total members: {len(new_members)}",
        user_id=int(user_id)
    )
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"msg": f"Project members updated. Total members: {len(new_members)}"})


# ======================================
# ============ MEMBER MANAGEMENT =========
# ======================================

@admin.route('/members', methods=['GET'])
@jwt_required()
@admin_required
def get_members():
    """Get all members"""
    members = User.query.filter_by(role='member').all()
    return jsonify({"members": [{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "role": u.role
    } for u in members]})


@admin.route('/members', methods=['POST'])
@jwt_required()
@admin_required
def add_member():
    """Add a new member"""
    data = request.json

    if not data:
        return jsonify({"msg": "No data received"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "User already exists"}), 400

    user = User(
        name=data['name'],
        email=data['email'],
        role=data.get('role')
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "Member added successfully", "member_id": user.id}), 201


@admin.route('/members/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def edit_member(user_id):
    """Edit member info"""
    user = User.query.get_or_404(user_id)
    data = request.json

    user.name = data.get('name', user.name)
    user.email = data.get('email', user.email)
    if data.get('password'):
        user.set_password(data['password'])
    user.role = data.get('role', user.role)

    db.session.commit()
    return jsonify({"msg": "Member info updated"})


@admin.route('/members/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def remove_member(user_id):
    """Delete member and unassign their tasks"""
    user = User.query.get_or_404(user_id)
    
    # Unassign all tasks
    tasks = Task.query.filter_by(assigned_to=user.id).all()
    for t in tasks:
        t.assigned_to = None

    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "Member removed, tasks unassigned"})


# ======================================
# ============ TASK ROUTES ==============
# ======================================

@admin.route('/projects/<int:project_id>/tasks', methods=['POST'])
@jwt_required()
@admin_required
def create_task(project_id):
    """Create a task for a project"""
    project = Project.query.get_or_404(project_id)
    data = request.json
    
    task = Task(
        title=data['title'],
        description=data.get('description'),
        status=data.get('status', 'todo'),
        priority=data.get('priority', 'medium'),
        due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None,
        project_id=project_id,
        assigned_to=data.get('assigned_to')
    )
    
    db.session.add(task)
    
    # Log activity
    user_id = get_jwt_identity()
    log = ActivityLog(
        action=f"Created task '{task.title}'",
        user_id=int(user_id)
    )
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"msg": "Task created", "task_id": task.id}), 201


@admin.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_task(task_id):
    """Update a task"""
    task = Task.query.get_or_404(task_id)
    data = request.json
    
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.status = data.get('status', task.status)
    task.priority = data.get('priority', task.priority)
    task.due_date = datetime.fromisoformat(data['due_date']) if data.get('due_date') else task.due_date
    task.assigned_to = data.get('assigned_to', task.assigned_to)
    
    # Log activity
    user_id = get_jwt_identity()
    log = ActivityLog(
        action=f"Updated task '{task.title}'",
        user_id=int(user_id)
    )
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"msg": "Task updated"})


@admin.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_task(task_id):
    """Delete a task"""
    task = Task.query.get_or_404(task_id)
    task_title = task.title
    
    db.session.delete(task)
    
    # Log activity
    user_id = get_jwt_identity()
    log = ActivityLog(
        action=f"Deleted task '{task_title}'",
        user_id=int(user_id)
    )
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"msg": "Task deleted"})


@admin.route('/tasks', methods=['GET'])
@jwt_required()
@admin_required
def get_all_tasks():
    """Get all tasks with optional filtering"""
    query = Task.query
    
    # Filter by status
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)
    
    # Filter by priority
    priority = request.args.get('priority')
    if priority:
        query = query.filter_by(priority=priority)
    
    # Filter by assignee
    assignee_id = request.args.get('assignee_id')
    if assignee_id:
        query = query.filter_by(assigned_to=int(assignee_id))
    
    # Filter by project
    project_id = request.args.get('project_id')
    if project_id:
        query = query.filter_by(project_id=int(project_id))
    
    tasks = query.all()
    
    return jsonify({
        "tasks": [{
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "priority": t.priority,
            "due_date": t.due_date.isoformat() if t.due_date else None,
            "assigned_to": t.assigned_to,
            "assignee_name": User.query.get(t.assigned_to).name if t.assigned_to else None,
            "project_id": t.project_id,
            "project_name": Project.query.get(t.project_id).name
        } for t in tasks]
    })


# ======================================
# ============ REPORT ROUTES ============
# ======================================

@admin.route('/reports/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_report_stats():
    """Get report statistics"""
    # 1. Summary Counts
    total_projects = Project.query.count()
    total_tasks = Task.query.count()
    total_members = User.query.filter_by(role='member').count()
    
    # 2. Task Status Distribution
    tasks_by_status = db.session.query(Task.status, db.func.count(Task.status)).group_by(Task.status).all()
    status_data = {status: count for status, count in tasks_by_status}
    
    # 3. Task Priority Distribution
    tasks_by_priority = db.session.query(Task.priority, db.func.count(Task.priority)).group_by(Task.priority).all()
    priority_data = {priority: count for priority, count in tasks_by_priority}
    
    # 4. Completion Rate
    completed_tasks = status_data.get('completed', 0)
    completion_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0

    return jsonify({
        "summary": {
            "total_projects": total_projects,
            "total_tasks": total_tasks,
            "total_members": total_members,
            "completion_rate": completion_rate
        },
        "status_distribution": [
            {"name": "To Do", "value": status_data.get('todo', 0), "color": "#FF8042"},
            {"name": "In Progress", "value": status_data.get('in_progress', 0), "color": "#0088FE"},
            {"name": "Completed", "value": status_data.get('completed', 0), "color": "#00C49F"}
        ],
        "priority_distribution": [
            {"name": "Low", "value": priority_data.get('low', 0)},
            {"name": "Medium", "value": priority_data.get('medium', 0)},
            {"name": "High", "value": priority_data.get('high', 0)}
        ]
    })
