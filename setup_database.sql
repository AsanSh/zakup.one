-- Создание таблиц и админа для ZAKUP.ONE
-- Выполните: psql zakup_db -f setup_database.sql

-- Создание типа enum для статусов заказов
CREATE TYPE orderstatus AS ENUM ('NEW', 'IN_PROGRESS', 'COLLECTED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- Создание типа enum для статусов доставки
CREATE TYPE deliverystatus AS ENUM ('PENDING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED');

-- Таблица поставщиков
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    contact_email VARCHAR,
    contact_phone VARCHAR,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_suppliers_id ON suppliers(id);

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    full_name VARCHAR NOT NULL,
    phone VARCHAR,
    company VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_id ON users(id);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    delivery_address VARCHAR NOT NULL,
    delivery_comment TEXT,
    delivery_date TIMESTAMP WITH TIME ZONE,
    estimated_delivery_date TIMESTAMP WITH TIME ZONE,
    tracking_number VARCHAR,
    contact_person VARCHAR,
    contact_phone VARCHAR,
    attached_file VARCHAR,
    status orderstatus DEFAULT 'NEW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_orders_id ON orders(id);
CREATE INDEX IF NOT EXISTS ix_orders_status ON orders(status);

-- Таблица товаров
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    article VARCHAR,
    unit VARCHAR,
    price DOUBLE PRECISION NOT NULL,
    category VARCHAR,
    description TEXT,
    country VARCHAR,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_products_id ON products(id);
CREATE INDEX IF NOT EXISTS ix_products_name ON products(name);
CREATE INDEX IF NOT EXISTS ix_products_article ON products(article);
CREATE INDEX IF NOT EXISTS ix_products_category ON products(category);

-- Таблица позиций заказа
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity DOUBLE PRECISION NOT NULL,
    price DOUBLE PRECISION NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_order_items_id ON order_items(id);

-- Таблица отслеживания доставки
CREATE TABLE IF NOT EXISTS delivery_tracking (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL UNIQUE REFERENCES orders(id),
    tracking_number VARCHAR,
    carrier VARCHAR,
    status deliverystatus DEFAULT 'PENDING',
    shipped_at TIMESTAMP WITH TIME ZONE,
    estimated_delivery_date TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    current_location VARCHAR,
    destination VARCHAR,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_delivery_tracking_id ON delivery_tracking(id);
CREATE INDEX IF NOT EXISTS ix_delivery_tracking_status ON delivery_tracking(status);

-- Таблица событий доставки
CREATE TABLE IF NOT EXISTS delivery_events (
    id SERIAL PRIMARY KEY,
    tracking_id INTEGER NOT NULL REFERENCES delivery_tracking(id),
    status deliverystatus NOT NULL,
    location VARCHAR,
    description TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_delivery_events_occurred_at ON delivery_events(occurred_at);

-- Создание админа
-- Email: admin@zakup.one
-- Пароль: admin123
INSERT INTO users (email, full_name, company, hashed_password, is_admin, is_verified, is_active, created_at)
VALUES (
  'admin@zakup.one',
  'Администратор',
  'ZAKUP.ONE',
  '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',  -- admin123 (bcrypt)
  true,
  true,
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  is_admin = true,
  is_verified = true,
  is_active = true,
  hashed_password = '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';

-- Вывод информации
SELECT 'Таблицы созданы успешно!' AS status;
SELECT email, is_admin, is_verified, is_active FROM users WHERE email = 'admin@zakup.one';

