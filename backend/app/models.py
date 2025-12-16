from . import db
from datetime import datetime
from flask_bcrypt import generate_password_hash, check_password_hash

# Association table for many-to-many: Project ↔ User
project_members = db.Table(
    'project_members',
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin' or 'member'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    tasks = db.relationship('Task', backref='assignee', lazy=True, foreign_keys='Task.assigned_to')
    comments = db.relationship('Comment', backref='author', lazy=True)
    activity_logs = db.relationship('ActivityLog', backref='user', lazy=True)
    projects = db.relationship(
        'Project', secondary=project_members, back_populates='members'
    )

    def set_password(self, raw_password):
        self.password = generate_password_hash(raw_password).decode('utf-8')

    def check_password(self, raw_password):
        return check_password_hash(self.password, raw_password)

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.DateTime, nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)  # Renamed from deadline
    completion_date = db.Column(db.DateTime, nullable=True)
    priority = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    tasks = db.relationship('Task', backref='project', lazy=True, cascade='all, delete-orphan')
    members = db.relationship(
        'User', secondary=project_members, back_populates='projects'
    )
    files = db.relationship('ProjectFile', backref='project', lazy=True, cascade='all, delete-orphan')

class Task(db.Model):
    __tablename__ = 'tasks'
    # Composite primary key: project_id + task_number
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), primary_key=True, nullable=False)
    task_number = db.Column(db.Integer, primary_key=True, nullable=False)
    
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='todo')  # todo, in_progress, pending_review, completed
    priority = db.Column(db.String(20), default='medium')  # low, medium, high
    start_date = db.Column(db.DateTime, nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    completion_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    comments = db.relationship('Comment', backref='task', lazy=True, cascade='all, delete-orphan')
    attachments = db.relationship('Attachment', backref='task', lazy=True, cascade='all, delete-orphan')


class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Composite foreign key to Task
    task_project_id = db.Column(db.Integer, nullable=False)
    task_number = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    __table_args__ = (
        db.ForeignKeyConstraint(
            ['task_project_id', 'task_number'],
            ['tasks.project_id', 'tasks.task_number'],
            ondelete='CASCADE'
        ),
    )

class Attachment(db.Model):
    __tablename__ = 'attachments'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200), nullable=False)
    file_url = db.Column(db.String(300), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    # Composite foreign key to Task
    task_project_id = db.Column(db.Integer, nullable=False)
    task_number = db.Column(db.Integer, nullable=False)
    
    __table_args__ = (
        db.ForeignKeyConstraint(
            ['task_project_id', 'task_number'],
            ['tasks.project_id', 'tasks.task_number'],
            ondelete='CASCADE'
        ),
    )

class ProjectFile(db.Model):
    __tablename__ = 'project_files'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200), nullable=False)
    file_url = db.Column(db.String(300), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(300), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=True)


class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(500), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # task_status, comment, file, assignment, review
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Who receives the notification
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    # Reference to related entities (optional)
    task_project_id = db.Column(db.Integer, nullable=True)
    task_number = db.Column(db.Integer, nullable=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=True)
    
    # Who triggered the notification
    triggered_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    user = db.relationship('User', foreign_keys=[user_id], backref='notifications')
    triggerer = db.relationship('User', foreign_keys=[triggered_by])
