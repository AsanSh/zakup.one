# Быстрый старт ZAKUP.ONE

## Запуск проекта

### 1. Backend (FastAPI)

```bash
# Установка зависимостей
pip install -r requirements.txt

# Создайте файл .env (см. .env.example)
# Настройте DATABASE_URL для PostgreSQL

# Примените миграции
alembic upgrade head

# Запустите сервер
python run.py
```

Backend будет доступен на: http://localhost:8000
API документация: http://localhost:8000/api/docs

### 2. Frontend (React)

```bash
# Перейдите в директорию фронтенда
cd frontend

# Установите зависимости
npm install

# Запустите dev сервер
npm run dev
```

Frontend будет доступен на: http://localhost:5467

## Первые шаги

1. **Запустите backend** (порт 8000)
2. **Запустите frontend** (порт 5467)
3. Откройте http://localhost:5467
4. Зарегистрируйтесь как новый пользователь
5. Администратор должен верифицировать ваш аккаунт через API:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/admin/users/{user_id}/verify"
   ```
6. Войдите в систему
7. Создайте поставщика через админ API:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/admin/suppliers" \
     -H "Content-Type: application/json" \
     -d '{"name": "Поставщик 1", "contact_email": "supplier@example.com"}'
   ```
8. Загрузите прайс-лист:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/admin/import-price-list" \
     -F "file=@прайс-лист-01.10.25.xlsx" \
     -F "supplier_id=1"
   ```
9. Теперь можно искать товары и создавать заявки!

## Структура проекта

```
webscrp/
├── app/              # Backend (FastAPI)
├── frontend/         # Frontend (React)
├── alembic/          # Миграции БД
└── uploads/          # Загруженные файлы
```

## Основные страницы фронтенда

- `/login` - Вход
- `/register` - Регистрация
- `/search` - Поиск товаров
- `/cart` - Корзина
- `/orders` - История заявок
- `/orders/create` - Оформление заявки

## API эндпоинты

### Публичные
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход
- `GET /api/v1/products/search?q=...` - Поиск товаров

### Защищенные (требуют авторизации)
- `GET /api/v1/orders` - Список заявок
- `POST /api/v1/orders` - Создать заявку

### Админ (требуют админ-доступ)
- `GET /api/v1/admin/suppliers` - Список поставщиков
- `POST /api/v1/admin/suppliers` - Создать поставщика
- `POST /api/v1/admin/import-price-list` - Загрузить прайс-лист
- `GET /api/v1/admin/users` - Список пользователей
- `POST /api/v1/admin/users/{id}/verify` - Верифицировать пользователя

