"""Fix price_list_updates frequency enum

Revision ID: fix_frequency_enum
Revises: 982bdd5fd794
Create Date: 2025-01-10 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fix_frequency_enum'
down_revision = '982bdd5fd794'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Удаляем старый constraint, если он есть
    # Это constraint, который проверяет значения frequency и вызывает ошибку
    try:
        op.execute("ALTER TABLE price_list_updates DROP CONSTRAINT IF EXISTS price_list_updates_frequency_check;")
    except Exception as e:
        # Игнорируем ошибку, если constraint не существует
        print(f"Note: Could not drop constraint (may not exist): {e}")
        pass
    
    # Изменяем тип колонки frequency на VARCHAR, если она была enum
    # Это позволит использовать строковые значения напрямую
    try:
        # Проверяем текущий тип колонки
        conn = op.get_bind()
        result = conn.execute(sa.text("""
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'price_list_updates' 
            AND column_name = 'frequency';
        """))
        
        current_type = result.scalar()
        
        if current_type and current_type != 'character varying':
            # Изменяем тип на VARCHAR
            op.execute("""
                ALTER TABLE price_list_updates 
                ALTER COLUMN frequency TYPE VARCHAR(20) 
                USING frequency::text;
            """)
    except Exception as e:
        print(f"Note: Could not alter frequency column type: {e}")
        pass


def downgrade() -> None:
    # В downgrade просто удаляем constraint, если он был создан
    try:
        op.execute("ALTER TABLE price_list_updates DROP CONSTRAINT IF EXISTS price_list_updates_frequency_check;")
    except:
        pass

