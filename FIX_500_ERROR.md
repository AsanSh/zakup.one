# Исправление ошибки 500 Internal Server Error

## Проблема

При попытке входа возникает ошибка **500 Internal Server Error** из-за того, что PostgreSQL не запущен.

## Решение

### Шаг 1: Запустите PostgreSQL

**macOS:**
```bash
# Проверьте, установлен ли PostgreSQL
which psql

# Если установлен через Homebrew:
brew services start postgresql@14
# или
brew services start postgresql

# Если установлен другим способом, найдите и запустите сервис
```

**Linux:**
```bash
sudo systemctl start postgresql
```

**Windows:**
- Откройте Services (services.msc)
- Найдите PostgreSQL и запустите

### Шаг 2: Создайте базу данных

```bash
createdb zakup_db
```

Если не работает, попробуйте:
```bash
psql postgres
CREATE DATABASE zakup_db;
\q
```

### Шаг 3: Настройте подключение

Отредактируйте файл `.env` и укажите правильные данные:

```env
DATABASE_URL=postgresql://ваш_пользователь:ваш_пароль@localhost:5432/zakup_db
```

**По умолчанию:**
- Пользователь: `postgres` (или ваш текущий пользователь)
- Пароль: (если не установлен, оставьте пустым или укажите ваш пароль)
- База: `zakup_db`

### Шаг 4: Выполните миграции

```bash
alembic upgrade head
```

### Шаг 5: Создайте админа

```bash
psql zakup_db -f create_admin_sql.sql
```

### Шаг 6: Перезапустите backend

```bash
# Остановите текущий процесс
pkill -f "python3 run.py"

# Запустите заново
python3 run.py
```

## Альтернатива: Использовать SQLite (для разработки)

Если PostgreSQL недоступен, можно временно использовать SQLite:

1. Измените `DATABASE_URL` в `.env`:
   ```env
   DATABASE_URL=sqlite:///./zakup.db
   ```

2. Перезапустите backend

3. Выполните миграции (они автоматически создадут SQLite базу)

⚠️ **Внимание:** SQLite только для разработки! Для продакшена используйте PostgreSQL.

## Проверка

После настройки проверьте:

```bash
# 1. PostgreSQL запущен
pg_isready -h localhost -p 5432

# 2. Backend работает
curl http://localhost:8000/health

# 3. API отвечает
curl http://localhost:8000/api/docs

# 4. Попытка входа (должна вернуть 401, а не 500)
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@zakup.one&password=admin123"
```

Если все настроено правильно, вы получите либо:
- **200 OK** с токеном (если админ создан)
- **401 Unauthorized** (если пароль неверный)
- **503 Service Unavailable** (если БД недоступна)

Но **НЕ 500 Internal Server Error**!

