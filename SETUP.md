# Инструкция по настройке проекта

## 1. Установка зависимостей

```bash
pip install -r requirements.txt
```

## 2. Настройка базы данных

Создайте файл `.env` в корне проекта со следующим содержимым:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/zakup_db

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Storage
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760

# Application
DEBUG=True
API_V1_PREFIX=/api/v1
```

**Важно:** Замените `user`, `password` и `zakup_db` на ваши реальные данные PostgreSQL.

## 3. Создание базы данных

```bash
# Создайте базу данных в PostgreSQL
createdb zakup_db

# Или через psql:
psql -U postgres
CREATE DATABASE zakup_db;
```

## 4. Применение миграций

```bash
# Создать первую миграцию
alembic revision --autogenerate -m "Initial migration"

# Применить миграции
alembic upgrade head
```

## 5. Запуск приложения

```bash
python run.py
```

Приложение будет доступно по адресу: http://localhost:8000

API документация: http://localhost:8000/api/docs

## 6. Тестирование API

### Регистрация пользователя

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "full_name": "Иван Иванов",
    "phone": "+996555123456",
    "company": "СтройКомпания",
    "password": "password123"
  }'
```

### Создание поставщика (требует админ-доступ)

```bash
curl -X POST "http://localhost:8000/api/v1/admin/suppliers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Поставщик 1",
    "contact_email": "supplier@example.com",
    "contact_phone": "+996555123456"
  }'
```

### Загрузка прайс-листа

```bash
curl -X POST "http://localhost:8000/api/v1/admin/import-price-list" \
  -F "file=@прайс-лист-01.10.25.xlsx" \
  -F "supplier_id=1" \
  -F "header_row=7" \
  -F "start_row=8"
```

## Структура проекта

```
webscrp/
├── app/                    # Основное приложение
│   ├── api/               # API эндпоинты
│   ├── core/              # Конфигурация
│   ├── models/            # Модели БД
│   └── services/          # Бизнес-логика
├── alembic/               # Миграции БД
├── uploads/               # Загруженные файлы
├── price_list_parser.py  # Парсер прайс-листов
└── run.py                 # Точка входа
```

## Следующие шаги

1. ✅ Базовая структура проекта
2. ✅ Модели базы данных
3. ✅ API эндпоинты
4. ✅ Интеграция парсера
5. ⏳ Создание фронтенда (React)
6. ⏳ Умный поиск (Elasticsearch)
7. ⏳ Массовое управление ценами
8. ⏳ NLP для текстового ввода
9. ⏳ OCR для распознавания фото

