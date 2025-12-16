"""add notification model

Revision ID: e5f6g7h8i9j0
Revises: 04a08a2af90a
Create Date: 2024-12-16 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e5f6g7h8i9j0'
down_revision = '04a08a2af90a'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('message', sa.String(length=500), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=True, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.Integer(), nullable=True),
        sa.Column('project_id', sa.Integer(), nullable=True),
        sa.Column('triggered_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ),
        sa.ForeignKeyConstraint(['triggered_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('notifications')
