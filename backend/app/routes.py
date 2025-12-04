from flask import Blueprint, request, jsonify
from .models import User, Project, Task, Comment, Attachment, ActivityLog, db
from . import db
from flask_jwt_extended import create_access_token, jwt_required, JWTManager, get_jwt_identity
from datetime import datetime, timedelta

main = Blueprint('main', __name__)

# Initialize JWT in __init__.py
# jwt = JWTManager(app)

# Check Status of server
@main.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Backend is running"}), 200

# Check database connection
@main.route('/health/db', methods=['GET'])
def health_db():
    try:
        # Try a simple query to test DB connection
        user_count = User.query.count()
        return jsonify({"status": "ok", "message": "Database is connected", "user_count": user_count}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Database error: {str(e)}"}), 500

# Helper to check admin role
def admin_required(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role != 'admin':
            return jsonify({"msg": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

@main.route('/register', methods=['POST'])
def register():
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
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=8))
    return jsonify({"access_token": access_token, "role": user.role, "name": user.name, "user_id": user.id})


#======================================#
#============admin routes =============#
#======================================#

@main.route('/admin/projects', methods=['GET'])
@jwt_required()
@admin_required
def get_projects():
    projects = Project.query.all()
    return jsonify({"projects": [{
        "id": p.id,
        "title": p.name,
        "description": p.description,
        "deadline": p.deadline,
        "priority": p.priority
    } for p in projects]})


@main.route('/admin/projects', methods=['POST'])
@jwt_required()
@admin_required
def create_project():
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


@main.route('/admin/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
@admin_required
def edit_project(project_id):
    project = Project.query.get_or_404(project_id)
    data = request.json
    project.name = data.get('name', project.name)
    project.description = data.get('description', project.description)
    project.deadline = datetime.fromisoformat(data['deadline']) if data.get('deadline') else project.deadline
    project.priority = data.get('priority', project.priority)
    db.session.commit()
    return jsonify({"msg": "Project updated"})


@main.route('/admin/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({"msg": "Project deleted"})

# For assigning members to project
@main.route('/admin/projects/<int:project_id>/members', methods=['PUT'])
@jwt_required()
@admin_required
def update_project_members(project_id):
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

#add new member
@main.route('/admin/members', methods=['GET'])
@jwt_required()
@admin_required
def get_members():
    members = User.query.filter_by(role='member').all()
    return jsonify({"members": [{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "role": u.role
    } for u in members]})

@main.route('/admin/members', methods=['POST'])
@jwt_required()
@admin_required
def add_member():
    data = request.json
    # print("DEBUG: Received data", data, flush=True)

    if not data:
        # print("DEBUG: No data received")
        return jsonify({"msg": "No data received"}), 400

    if User.query.filter_by(email=data['email']).first():
        # print("DEBUG: User already exists:", data['email'])
        return jsonify({"msg": "User already exists"}), 400

    # print("DEBUG: Creating user...")
    user = User(
        name=data['name'],
        email=data['email'],
        role=data.get('role')
    )
    user.set_password(data['password'])
    print("DEBUG: Password hashed successfully")

    db.session.add(user)
    db.session.commit()
    print("DEBUG: User committed to DB")

    return jsonify({"msg": "Member added successfully", "member_id": user.id}), 201

# Edit member info
@main.route('/admin/members/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def edit_member(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json

    user.name = data.get('name', user.name)
    user.email = data.get('email', user.email)
    if data.get('password'):
        user.set_password(data['password'])
    user.role = data.get('role', user.role)

    db.session.commit()
    return jsonify({"msg": "Member info updated"})

#delete member, also unassign their tasks
@main.route('/admin/members/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def remove_member(user_id):
    user = User.query.get_or_404(user_id)
    
    # Unassign all tasks
    tasks = Task.query.filter_by(assigned_to=user.id).all()
    for t in tasks:
        t.assigned_to = None

    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "Member removed, tasks unassigned"})

# Get single project with full details (tasks, members, activity logs)
@main.route('/admin/projects/<int:project_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_project_details(project_id):
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


# Create task for a project
@main.route('/admin/projects/<int:project_id>/tasks', methods=['POST'])
@jwt_required()
@admin_required
def create_task(project_id):
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


# Update task
@main.route('/admin/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_task(task_id):
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


# Delete task
@main.route('/admin/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_task(task_id):
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


# Get all tasks with optional filtering
@main.route('/admin/tasks', methods=['GET'])
@jwt_required()
@admin_required
def get_all_tasks():
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


# Get comments for a task
@main.route('/tasks/<int:task_id>/comments', methods=['GET'])
@jwt_required()
def get_task_comments(task_id):
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




#======================================#
#============member routes ============#
#======================================#

@main.route('/member/projects', methods=['GET'])
@jwt_required()
def member_projects():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    projects = [{
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "deadline": p.deadline,
        "priority": p.priority
    } for p in user.projects]
    return jsonify(projects)

@main.route('/member/projects/<int:project_id>/tasks', methods=['GET'])
@jwt_required()
def project_tasks(project_id):
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
        "due_date": t.due_date.isoformat() if t.due_date else None,
        "assigned_to": t.assigned_to,
        "assignee_name": User.query.get(t.assigned_to).name if t.assigned_to else None
    } for t in project.tasks]
    return jsonify(tasks)

@main.route('/member/tasks/<int:task_id>/status', methods=['PUT'])
@jwt_required()
def update_task_status(task_id):
    user_id = get_jwt_identity()
    task = Task.query.get_or_404(task_id)
    if task.assigned_to != int(user_id):
        return jsonify({"msg": "Not authorized"}), 403
    
    data = request.json
    task.status = data.get('status', task.status)
    
    # Log activity
    log = ActivityLog(
        action=f"Updated task '{task.title}' status to '{task.status}'",
        user_id=int(user_id)
    )
    db.session.add(log)
    
    db.session.commit()
    return jsonify({"msg": "Task status updated"})


@main.route('/member/tasks', methods=['GET'])
@jwt_required()
def get_my_tasks():
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



@main.route('/member/tasks/<int:task_id>/comment', methods=['POST'])
@jwt_required()
def add_comment(task_id):
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


@main.route('/member/tasks/<int:task_id>/attachment', methods=['POST'])
@jwt_required()
def add_attachment(task_id):
    data = request.json
    identity = get_jwt_identity()
    task = Task.query.get_or_404(task_id)
    attachment = Attachment(
        filename=data['filename'],
        file_url=data['file_url'],
        task_id=task.id
    )
    db.session.add(attachment)
    db.session.commit()
    return jsonify({"msg": "Attachment added"})
