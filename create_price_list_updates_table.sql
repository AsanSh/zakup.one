-- Создание таблицы для автоматического обновления прайс-листов
CREATE TABLE IF NOT EXISTS price_list_updates (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    download_url VARCHAR(500) NOT NULL,
    frequency VARCHAR(20) DEFAULT 'manual' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'manual')),
    header_row INTEGER DEFAULT 7,
    start_row INTEGER DEFAULT 8,
    is_active BOOLEAN DEFAULT TRUE,
    last_update TIMESTAMP WITH TIME ZONE,
    next_update TIMESTAMP WITH TIME ZONE,
    last_imported_count INTEGER DEFAULT 0,
    last_updated_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_price_list_updates_supplier_id ON price_list_updates (supplier_id);
CREATE INDEX IF NOT EXISTS ix_price_list_updates_next_update ON price_list_updates (next_update) WHERE is_active = TRUE;

