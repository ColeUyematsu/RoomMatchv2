"""Add profile fields to User model

Revision ID: 96f3ec68cc15
Revises: af6ba84eb024
Create Date: 2025-02-02 21:29:47.048052

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '96f3ec68cc15'
down_revision: Union[str, None] = 'af6ba84eb024'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('hometown', sa.String(), nullable=True))
    op.add_column('users', sa.Column('major', sa.String(), nullable=True))
    op.add_column('users', sa.Column('graduation_year', sa.String(), nullable=True))
    op.add_column('users', sa.Column('interests', sa.String(), nullable=True))
    op.add_column('users', sa.Column('prompt1', sa.String(), nullable=True))
    op.add_column('users', sa.Column('prompt2', sa.String(), nullable=True))
    op.add_column('users', sa.Column('prompt3', sa.String(), nullable=True))
    op.drop_column('users', 'selected_prompt1')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'selected_prompt3')
    op.drop_column('users', 'selected_prompt2')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('users', sa.Column('selected_prompt2', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('users', sa.Column('selected_prompt3', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('users', sa.Column('bio', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('users', sa.Column('selected_prompt1', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.drop_column('users', 'prompt3')
    op.drop_column('users', 'prompt2')
    op.drop_column('users', 'prompt1')
    op.drop_column('users', 'interests')
    op.drop_column('users', 'graduation_year')
    op.drop_column('users', 'major')
    op.drop_column('users', 'hometown')
    # ### end Alembic commands ###
