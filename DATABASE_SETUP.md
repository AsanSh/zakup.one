# Настройка базы данных

## Проблема: 500 Internal Server Error при входе

Ошибка возникает из-за того, что PostgreSQL не запущен или не настроен.

## Решение

### Вариант 1: Запустить PostgreSQL

**macOS (через Homebrew):**
```bash
# Установка (если еще не установлен)
brew install postgresql@14

# Запуск
brew services start postgresql@14

# Создание базы данных
createdb zakup_db
```

**Linux:**
```bash
# Запуск PostgreSQL
sudo systemctl start postgresql

# Создание базы данных
sudo -u postgres createdb zakup_db
```

**Windows:**
- Запустите PostgreSQL через Services или pgAdmin
- Создайте базу данных `zakup_db`

### Вариант 2: Настроить подключение

1. Создайте файл `.env` (уже создан автоматически)
2. Отредактируйте `DATABASE_URL` в `.env`:
   ```env
   DATABASE_URL=postgresql://ваш_пользователь:ваш_пароль@localhost:5432/zakup_db
   ```

3. Выполните миграции:
   ```bash
   alembic upgrade head
   ```

4. Создайте админа:
   ```bash
   psql zakup_db -f create_admin_sql.sql
   ```

### Вариант 3: Использовать SQLite для разработки (временно)

Если PostgreSQL недоступен, можно временно использовать SQLite:

1. Измените `DATABASE_URL` в `.env`:
   ```env
   DATABASE_URL=sqlite:///./zakup.db
   ```

2. Перезапустите backend

**⚠️ Внимание:** SQLite не рекомендуется для продакшена, только для разработки!

## Проверка

После настройки проверьте:

```bash
# Проверить подключение к PostgreSQL
pg_isready -h localhost -p 5432

# Проверить работу backend
curl http://localhost:8000/health

# Проверить API
curl http://localhost:8000/api/docs
```

## Создание админа

После настройки БД создайте админа:

```bash
psql zakup_db -f create_admin_sql.sql
```

Или через Python скрипт:
```bash
python3 create_admin.py
```

