# Ссылки проекта ZAKUP.ONE

## 🌐 GitHub

**Репозиторий:**  
https://github.com/AsanSh/zakup.one.git

**Клонирование:**
```bash
git clone https://github.com/AsanSh/zakup.one.git
cd zakup.one
```

## 🚀 Локальные адреса (Development)

### Frontend (React + Vite)
**URL:** http://localhost:5467

**Запуск:**
```bash
cd frontend
npm run dev
```

### Backend (FastAPI)
**URL:** http://localhost:8000

**API Base URL:** http://localhost:8000/api/v1

**Запуск:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### API Документация

**Swagger UI:**  
http://localhost:8000/api/docs

**ReDoc:**  
http://localhost:8000/api/redoc

**Health Check:**  
http://localhost:8000/health

## 📋 Основные страницы

### Публичные
- **Вход:** http://localhost:5467/login
- **Регистрация:** http://localhost:5467/register

### Клиентская часть (после входа)
- **Товары (Поиск):** http://localhost:5467/search
- **Сборка заявки (Корзина):** http://localhost:5467/cart
- **Мои заявки:** http://localhost:5467/orders
- **Профиль:** http://localhost:5467/profile

### Админ-панель (только для администраторов)
- **Dashboard:** http://localhost:5467/admin
- **Пользователи:** http://localhost:5467/admin/users
- **Заявки:** http://localhost:5467/admin/orders
- **Товары:** http://localhost:5467/admin/products
- **Поставщики:** http://localhost:5467/admin/price-lists/management/suppliers
- **Прайс-листы:** http://localhost:5467/admin/price-lists

## 🔐 Данные для входа

### Администратор
- **Email:** `admin@zakup.one`
- **Пароль:** `admin123`

### Создание админа
```bash
python3 check_and_create_admin.py
```

## 📚 API Endpoints

### Аутентификация
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход
- `GET /api/v1/auth/me` - Текущий пользователь

### Товары (Клиент)
- `GET /api/v1/products/search?q={query}&limit={limit}` - Поиск товаров
- `GET /api/v1/products/{id}` - Получить товар

### Заявки (Клиент)
- `GET /api/v1/orders` - Список заявок
- `POST /api/v1/orders` - Создать заявку
- `GET /api/v1/orders/{id}/tracking` - Отслеживание доставки

### Админ API
- `GET /api/v1/admin/stats` - Статистика
- `GET /api/v1/admin/users` - Список пользователей
- `GET /api/v1/admin/users/pending` - Пользователи на модерации
- `POST /api/v1/admin/users/{id}/verify` - Одобрить пользователя
- `POST /api/v1/admin/users/{id}/reject` - Отклонить пользователя
- `GET /api/v1/admin/orders` - Список заявок
- `PUT /api/v1/admin/orders/{id}/status` - Изменить статус заявки
- `GET /api/v1/admin/products` - Список товаров
- `PUT /api/v1/admin/products/{id}` - Обновить товар
- `POST /api/v1/admin/products/bulk-update` - Массовое обновление цен
- `GET /api/v1/admin/suppliers` - Список поставщиков
- `POST /api/v1/admin/suppliers` - Создать поставщика
- `POST /api/v1/admin/price-lists/download-and-import` - Скачать и импортировать прайс-лист

## 📖 Документация

### Техническая документация
- `TZ_ADMIN_PANEL.md` - Техническое задание для админ-панели
- `SUMMARY.md` - Итоговый отчет
- `FIXES_APPLIED.md` - Документация исправлений
- `PERFORMANCE_OPTIMIZATION.md` - Оптимизации производительности
- `QUICK_START.md` - Инструкция по запуску
- `FIX_ADMIN_LOGIN.md` - Исправление проблемы входа в админ-панель

### Настройка
- `ADMIN_INFO.txt` - Данные для входа администратора
- `QUICK_ADMIN.md` - Быстрое создание админа
- `ADDRESSES.md` - Адреса и порты

## 🛠️ Полезные команды

### Backend
```bash
# Запуск сервера
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Миграции
alembic upgrade head
alembic revision --autogenerate -m "description"

# Создание админа
python3 check_and_create_admin.py
```

### Frontend
```bash
# Запуск dev сервера
cd frontend && npm run dev

# Сборка для production
cd frontend && npm run build

# Проверка типов
cd frontend && npm run type-check
```

### База данных
```bash
# Подключение к PostgreSQL
psql zakup_db

# Создание админа через SQL
psql zakup_db -f create_admin_sql.sql
```

## 🔧 Технологии

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** FastAPI (Python), PostgreSQL
- **State Management:** Zustand
- **Routing:** React Router v6
- **HTTP Client:** Axios

## 📝 Полезные ссылки

- **React Router:** https://reactrouter.com/
- **FastAPI:** https://fastapi.tiangolo.com/
- **PostgreSQL:** https://www.postgresql.org/
- **Tailwind CSS:** https://tailwindcss.com/
- **Zustand:** https://zustand-demo.pmnd.rs/

---

**Последнее обновление:** 2024-12-15

