# 🚀 БЫСТРЫЙ СТАРТ DJANGO ПРОЕКТА

## ✅ Что создано

Полный Django проект с:
- ✅ Моделями (User, Product, Supplier, Order, OrderItem)
- ✅ API endpoints (auth, products, orders, admin)
- ✅ JWT аутентификацией
- ✅ Настройками для Spaceship
- ✅ WSGI для деплоя

## 📁 Структура

```
django_project/
├── manage.py
├── zakup_one/          # Настройки проекта
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── apps/
    ├── users/          # Аутентификация
    ├── products/       # Товары
    ├── orders/         # Заявки
    └── admin_panel/    # Админ-панель
```

## 🚀 Установка и запуск

### 1. Установить зависимости

```bash
pip install -r requirements_django.txt
```

### 2. Настроить базу данных

В `.env`:
```env
DATABASE_URL=postgresql://user:password@host:port/dbname
# или
DATABASE_URL=sqlite:///./zakup.db
```

### 3. Создать миграции

```bash
cd django_project
python manage.py makemigrations
python manage.py migrate
```

### 4. Создать суперадминистратора

```bash
python manage.py createsuperuser
```

### 5. Запустить сервер

```bash
python manage.py runserver
```

## 🔧 Настройка для Spaceship

### 1. Обновить wsgi.py

В корне проекта используйте `wsgi_django.py` или переименуйте его в `wsgi.py`.

### 2. Обновить requirements.txt

Замените на `requirements_django.txt` или скопируйте содержимое.

### 3. Настроить приложение в Spaceship

- **Application root**: `/home/kdlqemdxxn/zakup.one/django_project`
- **Startup file**: `zakup_one/wsgi.py` (или `wsgi.py` если переименовали)
- **Entry point**: `application`
- **Python version**: `3.11`

### 4. Запустить миграции на сервере

```bash
cd /home/kdlqemdxxn/zakup.one/django_project
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python manage.py migrate
```

## 📝 API Endpoints

- `POST /api/v1/auth/login` - Вход
- `POST /api/v1/auth/register` - Регистрация
- `GET /api/v1/auth/me` - Текущий пользователь
- `GET /api/v1/products/search` - Поиск товаров
- `POST /api/v1/orders/` - Создать заявку
- `GET /api/v1/orders/list` - Список заявок
- `GET /api/v1/admin/users` - Список пользователей (админ)
- `GET /api/v1/admin/products` - Список товаров (админ)
- `GET /api/v1/admin/orders` - Список заявок (админ)

## ⚠️ Важно

1. **Аутентификация**: Поддерживает form-data (`username`/`password`) и JSON (`email`/`password`)
2. **База данных**: Можно использовать ту же PostgreSQL
3. **Frontend**: Не требует изменений (API endpoints те же)
4. **JWT токены**: Совместимы с текущим frontend

## 🧪 Тестирование

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Login (form-data)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@test.com&password=test123"

# Login (JSON)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## 📚 Документация

Подробнее: `DJANGO_SETUP_COMPLETE.md`

