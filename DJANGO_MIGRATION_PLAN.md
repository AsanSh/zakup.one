# 🔄 ПЛАН МИГРАЦИИ С FASTAPI НА DJANGO

## 📋 Обзор

Проект будет перестроен с FastAPI на Django + Django REST Framework.

## 🎯 Структура проекта

```
zakup_one/
├── manage.py
├── zakup_one/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── users/
│   ├── products/
│   ├── orders/
│   └── admin_panel/
├── static/
├── media/
└── requirements.txt
```

## 📝 Шаги миграции

### 1. Установка Django и зависимостей
### 2. Создание структуры проекта
### 3. Перенос моделей (SQLAlchemy → Django ORM)
### 4. Создание API endpoints (FastAPI → Django REST Framework)
### 5. Настройка аутентификации (JWT)
### 6. Настройка статических файлов и SPA routing
### 7. Обновление wsgi.py
### 8. Миграции базы данных

## ⚠️ Важные замечания

- База данных останется той же (PostgreSQL/SQLite)
- API endpoints останутся теми же (`/api/v1/...`)
- Frontend не требует изменений
- Аутентификация через JWT сохранится

