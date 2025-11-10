# Данные для входа администратора

## Супер-админ (по умолчанию)

**Email:** `admin@zakup.one`  
**Пароль:** `admin123`

## Как создать админа

### Вариант 1: Через скрипт (требует запущенную БД)

```bash
# Убедитесь, что PostgreSQL запущен и база данных создана
# Затем выполните:
python3 create_admin.py
```

### Вариант 2: Через API (после запуска backend)

```bash
# 1. Запустите backend
python run.py

# 2. Создайте админа через API (в другом терминале)
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@zakup.one",
    "full_name": "Администратор",
    "phone": "+996555123456",
    "company": "ZAKUP.ONE",
    "password": "admin123"
  }'

# 3. Затем через SQL или через админ API сделайте пользователя админом
# (Нужно будет добавить эндпоинт для этого)
```

### Вариант 3: Через SQL напрямую

```sql
-- Подключитесь к базе данных
psql zakup_db

-- Вставьте админа (пароль: admin123, хеш bcrypt)
INSERT INTO users (email, full_name, company, hashed_password, is_admin, is_verified, is_active)
VALUES (
  'admin@zakup.one',
  'Администратор',
  'ZAKUP.ONE',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5',  -- admin123
  true,
  true,
  true
);
```

## Важно

⚠️ **Измените пароль после первого входа!**

Текущий пароль `admin123` - это временный пароль для разработки.  
В продакшене используйте сложный пароль.

