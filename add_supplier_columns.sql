-- Добавляем поля для параметров парсинга по умолчанию в таблицу suppliers
-- Этот скрипт можно выполнить напрямую в базе данных, если миграция не работает

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




