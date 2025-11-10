# Быстрое создание админа

## Данные для входа

**Email:** `admin@zakup.one`  
**Пароль:** `admin123`

## Способ 1: Через SQL (рекомендуется)

```bash
# 1. Убедитесь, что PostgreSQL запущен
# 2. Выполните миграции (если еще не выполнены)
alembic upgrade head

# 3. Выполните SQL скрипт
psql zakup_db -f create_admin_sql.sql
```

## Способ 2: Через psql вручную

```bash
psql zakup_db
```

Затем выполните:

```sql
INSERT INTO users (email, full_name, company, hashed_password, is_admin, is_verified, is_active, created_at)
VALUES (
  'admin@zakup.one',
  'Администратор',
  'ZAKUP.ONE',
  '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
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
```

## Способ 3: После запуска backend

1. Запустите backend: `python run.py`
2. Зарегистрируйтесь через API:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@zakup.one",
       "full_name": "Администратор",
       "phone": "+996555123456",
       "company": "ZAKUP.ONE",
       "password": "admin123"
     }'
   ```
3. Затем через SQL сделайте пользователя админом:
   ```sql
   UPDATE users SET is_admin = true, is_verified = true WHERE email = 'admin@zakup.one';
   ```

## После создания

1. Откройте http://localhost:5467
2. Войдите с данными выше
3. ⚠️ **Измените пароль после первого входа!**

