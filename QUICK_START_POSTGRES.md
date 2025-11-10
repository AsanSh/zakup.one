# Быстрый старт с PostgreSQL

## ✅ Что уже сделано:

1. ✅ Файл `.env` настроен на PostgreSQL
2. ✅ PostgreSQL запущен
3. ✅ База данных `zakup_db` создана (или будет создана)

## 📋 Следующие шаги:

### 1. Проверьте пароль PostgreSQL в `.env`

Откройте файл `.env` и убедитесь, что пароль правильный:
```env
DATABASE_URL=postgresql://postgres:ваш_пароль@localhost:5432/zakup_db
```

**По умолчанию:** Если PostgreSQL установлен через Homebrew, пароль обычно пустой или `postgres`.

### 2. Создайте/примените миграции

```bash
# Если миграции еще не созданы
alembic revision --autogenerate -m "Initial migration"

# Применить миграции
alembic upgrade head
```

### 3. Создайте администратора

```bash
# Через Python скрипт
python3 create_admin_simple.py

# Или через SQL
psql zakup_db -f create_admin_sql.sql
```

### 4. Запустите backend

```bash
python3 run.py
```

Backend будет доступен по адресу: http://localhost:8000

### 5. Запустите frontend

```bash
cd frontend
npm run dev
```

Frontend будет доступен по адресу: http://localhost:5467

## 🔧 Устранение проблем

### Ошибка: "password authentication failed"

**Решение 1:** Измените пароль в `.env`:
```env
DATABASE_URL=postgresql://postgres:ваш_реальный_пароль@localhost:5432/zakup_db
```

**Решение 2:** Сбросьте пароль PostgreSQL:
```bash
psql postgres
ALTER USER postgres PASSWORD 'новый_пароль';
```

**Решение 3:** Создайте нового пользователя:
```bash
psql postgres
CREATE USER zakup_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE zakup_db TO zakup_user;
```

Затем обновите `.env`:
```env
DATABASE_URL=postgresql://zakup_user:password123@localhost:5432/zakup_db
```

### Ошибка: "database does not exist"

Создайте базу данных:
```bash
createdb zakup_db
```

Или через psql:
```bash
psql postgres -c "CREATE DATABASE zakup_db;"
```

### Ошибка: "connection refused"

PostgreSQL не запущен. Запустите:
```bash
brew services start postgresql@14
```

## 📝 Проверка подключения

```bash
# Проверить, что PostgreSQL запущен
pg_isready -h localhost -p 5432

# Проверить подключение к базе
psql -h localhost -U postgres -d zakup_db -c "SELECT version();"

# Просмотреть список баз данных
psql -l
```

## 🎉 Готово!

После выполнения всех шагов ваше приложение будет работать с PostgreSQL!

