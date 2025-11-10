-- SQL скрипт для создания супер-админа
-- Email: admin@zakup.one
-- Пароль: admin123

-- Хеш пароля "admin123" (bcrypt)
-- Генерируется автоматически при первом входе или через Python скрипт

-- Если таблица users еще не создана, сначала выполните миграции:
-- alembic upgrade head

-- Создание/обновление админа
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

