"""add_purchase_price_and_markup_to_products

Revision ID: 982bdd5fd794
Revises: e2e8081136bf
Create Date: 2025-11-12 12:24:16.028398

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '982bdd5fd794'
down_revision = 'e2e8081136bf'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Добавляем поля purchase_price и markup в таблицу products
    op.add_column('products', sa.Column('purchase_price', sa.Float(), nullable=True))
    op.add_column('products', sa.Column('markup', sa.Float(), nullable=True, server_default='0.0'))
    
    # Для существующих товаров: purchase_price = price, markup = 0
    op.execute("UPDATE products SET purchase_price = price, markup = 0.0 WHERE purchase_price IS NULL")
    
    # Делаем purchase_price обязательным полем
    op.alter_column('products', 'purchase_price', nullable=False)


def downgrade() -> None:
    # Удаляем поля purchase_price и markup
    op.drop_column('products', 'markup')
    op.drop_column('products', 'purchase_price')

