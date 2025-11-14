#!/usr/bin/env python3
"""
Скрипт для быстрого добавления колонок в таблицу suppliers
Выполните этот скрипт, если миграция не работает
"""
import sys
from pathlib import Path

# Добавляем корневую директорию в путь
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import engine
from sqlalchemy import text

def apply_migration():
    """Применяет SQL скрипт для добавления колонок"""
    sql_script = """
    -- Добавляем колонки, если их еще нет
    DO $$
    BEGIN
        -- Добавляем default_header_row, если не существует
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'suppliers' 
            AND column_name = 'default_header_row'
        ) THEN
            ALTER TABLE suppliers ADD COLUMN default_header_row INTEGER DEFAULT 7;
        END IF;
        
        -- Добавляем default_start_row, если не существует
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'suppliers' 
            AND column_name = 'default_start_row'
        ) THEN
            ALTER TABLE suppliers ADD COLUMN default_start_row INTEGER DEFAULT 8;
        END IF;
    END $$;

    -- Обновляем существующие записи значениями из последних price_list_updates
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
    WHERE default_header_row IS NULL OR default_start_row IS NULL;
    """
    
    try:
        with engine.connect() as conn:
            conn.execute(text(sql_script))
            conn.commit()
            print("✅ Колонки успешно добавлены в таблицу suppliers")
            return True
    except Exception as e:
        print(f"❌ Ошибка при применении миграции: {e}")
        return False

if __name__ == "__main__":
    print("Применение миграции для добавления колонок в suppliers...")
    success = apply_migration()
    sys.exit(0 if success else 1)




