"""Add dates to Projects and Tasks

Revision ID: d4f9e1a2b5c3
Revises: b2d5eafd2d13
Create Date: 2025-12-11 19:50:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd4f9e1a2b5c3'
down_revision = 'b2d5eafd2d13'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to projects table
    op.add_column('projects', sa.Column('start_date', sa.DateTime(), nullable=True))
    op.add_column('projects', sa.Column('completion_date', sa.DateTime(), nullable=True))
    
    # Rename deadline to due_date in projects table
    op.alter_column('projects', 'deadline', new_column_name='due_date')
    
    # Add new columns to tasks table
    op.add_column('tasks', sa.Column('start_date', sa.DateTime(), nullable=True))
    op.add_column('tasks', sa.Column('completion_date', sa.DateTime(), nullable=True))


def downgrade():
    # Remove new columns from tasks table
    op.drop_column('tasks', 'completion_date')
    op.drop_column('tasks', 'start_date')
    
    # Rename due_date back to deadline in projects table
    op.alter_column('projects', 'due_date', new_column_name='deadline')
    
    # Remove new columns from projects table
    op.drop_column('projects', 'completion_date')
    op.drop_column('projects', 'start_date')
