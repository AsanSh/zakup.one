"""Add default parsing parameters to suppliers

Revision ID: add_supplier_default_params
Revises: add_drivers_delivery
Create Date: 2025-01-10 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_supplier_default_params'
down_revision = '982bdd5fd794'  # Исправляем на последнюю примененную миграцию
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Добавляем поля для параметров парсинга по умолчанию
    op.add_column('suppliers', sa.Column('default_header_row', sa.Integer(), nullable=True, server_default='7'))
    op.add_column('suppliers', sa.Column('default_start_row', sa.Integer(), nullable=True, server_default='8'))
    
    # Обновляем существующие записи значениями из последних price_list_updates
    op.execute("""
        UPDATE suppliers s
        SET 
            default_header_row = COALESCE(
                (SELECT header_row FROM price_list_updates 
                 WHERE supplier_id = s.id 
                 ORDER BY last_update DESC NULLS LAST, created_at DESC 
                 LIMIT 1),
                7
            ),
            default_start_row = COALESCE(
                (SELECT start_row FROM price_list_updates 
                 WHERE supplier_id = s.id 
                 ORDER BY last_update DESC NULLS LAST, created_at DESC 
                 LIMIT 1),
                8
            )
    """)


def downgrade() -> None:
    # Удаляем поля
    op.drop_column('suppliers', 'default_start_row')
    op.drop_column('suppliers', 'default_header_row')

