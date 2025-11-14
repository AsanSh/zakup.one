"""Add drivers and extend delivery tracking

Revision ID: add_drivers_delivery
Revises: e2e8081136bf
Create Date: 2025-01-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_drivers_delivery'
down_revision = '982bdd5fd794'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Создаем таблицу drivers
    op.create_table('drivers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=False),
        sa.Column('telegram_id', sa.String(), nullable=True),
        sa.Column('current_latitude', sa.Float(), nullable=True),
        sa.Column('current_longitude', sa.Float(), nullable=True),
        sa.Column('location_updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('is_available', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_drivers_phone'), 'drivers', ['phone'], unique=True)
    op.create_index(op.f('ix_drivers_telegram_id'), 'drivers', ['telegram_id'], unique=True)
    
    # Расширяем таблицу delivery_tracking
    op.add_column('delivery_tracking', sa.Column('driver_id', sa.Integer(), nullable=True))
    op.add_column('delivery_tracking', sa.Column('driver_latitude', sa.String(), nullable=True))
    op.add_column('delivery_tracking', sa.Column('driver_longitude', sa.String(), nullable=True))
    op.add_column('delivery_tracking', sa.Column('driver_location_updated_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('delivery_tracking', sa.Column('accepted_by', sa.String(), nullable=True))
    op.add_column('delivery_tracking', sa.Column('accepted_at', sa.DateTime(timezone=True), nullable=True))
    
    # Добавляем внешний ключ для driver_id
    op.create_foreign_key('fk_delivery_tracking_driver_id', 'delivery_tracking', 'drivers', ['driver_id'], ['id'])


def downgrade() -> None:
    # Удаляем внешний ключ
    op.drop_constraint('fk_delivery_tracking_driver_id', 'delivery_tracking', type_='foreignkey')
    
    # Удаляем колонки из delivery_tracking
    op.drop_column('delivery_tracking', 'accepted_at')
    op.drop_column('delivery_tracking', 'accepted_by')
    op.drop_column('delivery_tracking', 'driver_location_updated_at')
    op.drop_column('delivery_tracking', 'driver_longitude')
    op.drop_column('delivery_tracking', 'driver_latitude')
    op.drop_column('delivery_tracking', 'driver_id')
    
    # Удаляем таблицу drivers
    op.drop_index(op.f('ix_drivers_telegram_id'), table_name='drivers')
    op.drop_index(op.f('ix_drivers_phone'), table_name='drivers')
    op.drop_table('drivers')

