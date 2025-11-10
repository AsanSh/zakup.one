# Адреса приложения ZAKUP.ONE

## 🌐 Frontend (Клиентская часть)

### Основные страницы:
- **Главная (Каталог товаров):** http://localhost:5467/search
- **Корзина (Сборка заявки):** http://localhost:5467/cart
- **Мои заявки:** http://localhost:5467/orders
- **Профиль:** http://localhost:5467/profile
- **Создание заявки:** http://localhost:5467/orders/create

### Аутентификация:
- **Вход:** http://localhost:5467/login
- **Регистрация:** http://localhost:5467/register

## 🔐 Админ-панель

### Основные разделы:
- **Панель управления:** http://localhost:5467/admin
- **Пользователи:** http://localhost:5467/admin/users
- **Заявки:** http://localhost:5467/admin/orders
- **Товары:** http://localhost:5467/admin/products
- **Прайс-листы:** http://localhost:5467/admin/price-lists

### Управление прайс-листами:
- **Обновление прайс-листов:** http://localhost:5467/admin/price-lists/management/updates
- **Управление ценами:** http://localhost:5467/admin/price-lists/management/prices
- **Управление контрагентами:** http://localhost:5467/admin/price-lists/management/counterparties
- **Управление поставщиками:** http://localhost:5467/admin/price-lists/management/suppliers

## 🔧 Backend API

### Базовый URL:
- **API:** http://localhost:8000/api/v1

### Эндпоинты:

#### Аутентификация:
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход
- `GET /api/v1/auth/me` - Текущий пользователь

#### Товары (Клиент):
- `GET /api/v1/products/search?q=...` - Поиск товаров
- `GET /api/v1/products/{id}` - Получить товар

#### Заявки (Клиент):
- `GET /api/v1/orders` - Список заявок пользователя
- `POST /api/v1/orders` - Создать заявку
- `GET /api/v1/orders/{id}/tracking` - Отслеживание доставки

#### Админ API:
- `GET /api/v1/admin/users` - Список пользователей
- `POST /api/v1/admin/users/{id}/verify` - Верифицировать пользователя
- `POST /api/v1/admin/users/{id}/activate` - Активировать пользователя
- `POST /api/v1/admin/users/{id}/deactivate` - Деактивировать пользователя
- `GET /api/v1/admin/orders` - Все заявки
- `POST /api/v1/admin/orders/{id}/status` - Изменить статус заявки
- `GET /api/v1/admin/products` - Все товары
- `PUT /api/v1/admin/products/{id}` - Обновить товар
- `POST /api/v1/admin/products/bulk-update-prices` - Массовое обновление цен
- `GET /api/v1/admin/suppliers` - Список поставщиков
- `POST /api/v1/admin/suppliers` - Создать поставщика
- `PUT /api/v1/admin/suppliers/{id}` - Обновить поставщика
- `POST /api/v1/admin/suppliers/{id}/toggle-active` - Переключить активность
- `POST /api/v1/admin/import-price-list` - Импорт прайс-листа

### API Документация:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## 📝 Данные для входа

### Администратор:
- **Email:** admin@zakup.one
- **Пароль:** admin123
- **URL:** http://localhost:5467/login

### Обычный пользователь:
- Требуется регистрация через: http://localhost:5467/register
- После регистрации требуется верификация администратором

## 🚀 Запуск

### Backend:
```bash
cd /Users/asanshirgebaev/Documents/Private/Проги/webscrp
uvicorn app.main:app --reload --port 8000
```

### Frontend:
```bash
cd /Users/asanshirgebaev/Documents/Private/Проги/webscrp/frontend
npm run dev
```

## 📌 Порт по умолчанию

- **Frontend:** 5467
- **Backend:** 8000

