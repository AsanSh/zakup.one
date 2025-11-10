# Настройка PostgreSQL для ZAKUP.ONE

## Быстрая установка

### 1. Установка PostgreSQL

**macOS (через Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Linux (CentOS/RHEL):**
```bash
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Автоматическая настройка

Запустите скрипт настройки:
```bash
./setup_postgres.sh
```

### 3. Ручная настройка

#### Создание базы данных

```bash
# Войдите в PostgreSQL
psql postgres

# Создайте базу данных
CREATE DATABASE zakup_db;

# Создайте пользователя (опционально)
CREATE USER zakup_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE zakup_db TO zakup_user;

# Выйдите
\q
```

#### Настройка .env файла

Файл `.env` уже создан с настройками по умолчанию:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zakup_db
```

**Важно:** Измените пароль `postgres` на ваш реальный пароль PostgreSQL!

### 4. Применение миграций

```bash
# Создать миграции (если еще не созданы)
alembic revision --autogenerate -m "Initial migration"

# Применить миграции
alembic upgrade head
```

### 5. Создание администратора

```bash
# Через Python скрипт
python3 create_admin_simple.py

# Или через SQL
psql zakup_db -f create_admin_sql.sql
```

### 6. Запуск приложения

```bash
python3 run.py
```

## Проверка подключения

```bash
# Проверить, что PostgreSQL запущен
pg_isready -h localhost -p 5432

# Проверить подключение к базе
psql -h localhost -U postgres -d zakup_db -c "SELECT version();"
```

## Устранение проблем

### Ошибка: "connection refused"

PostgreSQL не запущен. Запустите:
```bash
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

### Ошибка: "password authentication failed"

Измените пароль в `.env` файле или создайте нового пользователя:
```sql
ALTER USER postgres PASSWORD 'новый_пароль';
```

### Ошибка: "database does not exist"

Создайте базу данных:
```bash
createdb zakup_db
```

## Рекомендации для продакшена

1. **Измените SECRET_KEY** в `.env` на случайную строку
2. **Используйте отдельного пользователя** БД (не postgres)
3. **Настройте бэкапы** базы данных
4. **Используйте SSL** для подключения
5. **Настройте firewall** для защиты БД

## Пример .env для продакшена

```env
DATABASE_URL=postgresql://zakup_user:strong_password@localhost:5432/zakup_db
SECRET_KEY=very-long-random-secret-key-here-min-32-chars
DEBUG=False
```

