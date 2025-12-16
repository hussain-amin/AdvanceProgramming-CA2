"""Task composite primary key

Revision ID: f6g7h8i9j0k1
Revises: e5f6g7h8i9j0
Create Date: 2024-01-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f6g7h8i9j0k1'
down_revision = 'e5f6g7h8i9j0'
branch_labels = None
depends_on = None


def upgrade():
    # Drop foreign keys first
    op.drop_constraint('comments_task_id_fkey', 'comments', type_='foreignkey')
    op.drop_constraint('attachments_task_id_fkey', 'attachments', type_='foreignkey')
    
    # Drop the notifications table and recreate (easier than modifying)
    op.drop_table('notifications')
    
    # Drop primary key and id column from tasks, add composite primary key
    op.drop_constraint('tasks_pkey', 'tasks', type_='primary')
    op.drop_column('tasks', 'id')
    
    # Add task_number column
    op.add_column('tasks', sa.Column('task_number', sa.Integer(), nullable=False))
    
    # Create composite primary key
    op.create_primary_key('tasks_pkey', 'tasks', ['project_id', 'task_number'])
    
    # Update comments table - remove task_id, add task_project_id and task_number
    op.drop_column('comments', 'task_id')
    op.add_column('comments', sa.Column('task_project_id', sa.Integer(), nullable=False))
    op.add_column('comments', sa.Column('task_number', sa.Integer(), nullable=False))
    op.create_foreign_key(
        'comments_task_fkey', 'comments', 'tasks',
        ['task_project_id', 'task_number'], ['project_id', 'task_number'],
        ondelete='CASCADE'
    )
    
    # Update attachments table - remove task_id, add task_project_id and task_number
    op.drop_column('attachments', 'task_id')
    op.add_column('attachments', sa.Column('task_project_id', sa.Integer(), nullable=False))
    op.add_column('attachments', sa.Column('task_number', sa.Integer(), nullable=False))
    op.create_foreign_key(
        'attachments_task_fkey', 'attachments', 'tasks',
        ['task_project_id', 'task_number'], ['project_id', 'task_number'],
        ondelete='CASCADE'
    )
    
    # Recreate notifications table with new schema
    op.create_table('notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('message', sa.String(length=500), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=True),
        sa.Column('task_project_id', sa.Integer(), nullable=True),
        sa.Column('task_number', sa.Integer(), nullable=True),
        sa.Column('project_id', sa.Integer(), nullable=True),
        sa.Column('triggered_by', sa.Integer(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['triggered_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    # This migration is not easily reversible due to data loss
    # A proper downgrade would require:
    # 1. Adding back task.id column
    # 2. Converting composite foreign keys back to single foreign keys
    # 3. Remapping all data
    pass
