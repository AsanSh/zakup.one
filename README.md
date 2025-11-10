# ZAKUP.ONE - Веб-платформа для снабженцев строительных компаний

Веб-платформа-агрегатор для снабженцев строительных компаний с единым доступом к оптовым товарам от множества поставщиков.

## Технологический стек

### Backend
- **Framework**: FastAPI (Python)
- **База данных**: PostgreSQL
- **Миграции**: Alembic
- **Парсинг Excel**: pandas + openpyxl

### Frontend
- **Framework**: React 18 + TypeScript
- **Сборщик**: Vite
- **Стили**: Tailwind CSS
- **Роутинг**: React Router
- **State Management**: Zustand
- **HTTP клиент**: Axios

## Структура проекта

```
webscrp/
├── app/                  # Backend (FastAPI)
│   ├── api/              # API эндпоинты
│   │   └── v1/
│   │       └── endpoints/
│   ├── core/             # Конфигурация и настройки
│   ├── models/           # Модели базы данных
│   └── services/         # Бизнес-логика
├── frontend/             # Frontend (React)
│   ├── src/
│   │   ├── api/          # API клиент
│   │   ├── components/   # React компоненты
│   │   ├── pages/        # Страницы
│   │   └── store/        # Zustand stores
│   └── package.json
├── alembic/              # Миграции БД
├── uploads/               # Загруженные файлы
├── price_list_parser.py   # Парсер прайс-листов
└── run.py                 # Точка входа backend

```

## Установка и запуск

### 1. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 2. Настройка базы данных

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите параметры подключения к PostgreSQL.

### 3. Создание базы данных

```bash
# Создайте базу данных в PostgreSQL
createdb zakup_db

# Примените миграции
alembic upgrade head
```

### 4. Запуск Backend

```bash
python run.py
```

Backend будет доступен по адресу: http://localhost:8000
API документация: http://localhost:8000/api/docs

### 5. Запуск Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен по адресу: http://localhost:5467

**Примечание**: Frontend настроен на прокси к backend через Vite, поэтому API запросы автоматически перенаправляются на `http://localhost:8000`

## Основные возможности

### MVP (Этап 1)

**Backend:**
- ✅ Парсинг прайс-листов из Excel
- ✅ API для загрузки прайс-листов
- ✅ Управление товарами и поставщиками
- ✅ Управление пользователями (снабженцами)
- ✅ Управление заявками
- ✅ Поиск товаров
- ✅ Создание заявок

**Frontend:**
- ✅ Авторизация и регистрация
- ✅ Поиск товаров с автодополнением
- ✅ Корзина товаров
- ✅ Оформление заявок
- ✅ История заявок
- ✅ Адаптивный дизайн

### Планируется

- Умный поиск с автодополнением (Elasticsearch)
- Массовое управление ценами
- Текстовый ввод заявок (NLP)
- Загрузка Excel/фото (OCR)
- Автоматизированный парсинг прайс-листов

## API эндпоинты

### Аутентификация
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход

### Товары
- `GET /api/v1/products/search?q=...` - Поиск товаров
- `GET /api/v1/products/{id}` - Получить товар

### Заявки
- `GET /api/v1/orders` - Список заявок
- `POST /api/v1/orders` - Создать заявку

### Админ-панель
- `GET /api/v1/admin/suppliers` - Список поставщиков
- `POST /api/v1/admin/suppliers` - Создать поставщика
- `POST /api/v1/admin/import-price-list` - Загрузить прайс-лист
- `GET /api/v1/admin/users` - Список пользователей
- `POST /api/v1/admin/users/{id}/verify` - Верифицировать пользователя
- `GET /api/v1/admin/orders` - Все заявки
- `POST /api/v1/admin/orders/{id}/status` - Изменить статус заявки

## Использование парсера прайс-листов

Парсер интегрирован в систему через `PriceImportService`:

```python
from app.services.price_import import PriceImportService

service = PriceImportService(db)
result = service.import_from_file(
    file_path="path/to/file.xlsx",
    supplier_id=1,
    header_row=7,
    start_row=8
)
```

## Разработка

### Создание миграций

```bash
alembic revision --autogenerate -m "Описание изменений"
alembic upgrade head
```

### Запуск тестов

```bash
# TODO: Добавить тесты
```

## Лицензия

MIT

