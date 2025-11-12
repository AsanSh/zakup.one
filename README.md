# ZAKUP.ONE - Платформа для закупок

Веб-платформа для управления закупками, прайс-листами и заявками.

## 🚀 Технологии

### Backend
- **FastAPI** - современный веб-фреймворк для Python
- **PostgreSQL** - реляционная база данных
- **SQLAlchemy** - ORM для работы с БД
- **Alembic** - миграции базы данных
- **JWT** - аутентификация

### Frontend
- **React 18** - библиотека для создания UI
- **TypeScript** - типизированный JavaScript
- **Vite** - сборщик и dev-сервер
- **Tailwind CSS** - утилитарный CSS фреймворк
- **Zustand** - управление состоянием
- **React Router** - маршрутизация

## 📋 Требования

- Python 3.9+
- Node.js 18+
- PostgreSQL 12+
- npm или yarn

## 🛠️ Установка

### 1. Клонирование репозитория

```bash
git clone https://github.com/AsanSh/zakup.one.git
cd zakup.one
```

### 2. Настройка Backend

```bash
# Создайте виртуальное окружение
python3 -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate

# Установите зависимости
pip install -r requirements.txt

# Настройте переменные окружения
cp .env.example .env
# Отредактируйте .env файл с вашими настройками БД
```

### 3. Настройка базы данных

```bash
# Создайте базу данных PostgreSQL
createdb zakup_db

# Выполните миграции
alembic upgrade head
```

### 4. Создание администратора

После выполнения миграций создайте администратора через SQL:

```sql
INSERT INTO users (email, full_name, company, hashed_password, is_admin, is_verified, is_active)
VALUES (
  'admin@zakup.one',
  'Администратор',
  'ZAKUP.ONE',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5',  -- пароль: admin123
  true,
  true,
  true
);
```

**Данные для входа администратора:**
- Email: `admin@zakup.one`
- Пароль: `admin123`

### 6. Настройка Frontend

```bash
cd frontend

# Установите зависимости
npm install

# Или используйте yarn
yarn install
```

## 🚀 Запуск

### Backend

```bash
# Из корневой директории проекта
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Или используйте скрипт
./start_backend.sh
```

Backend будет доступен по адресу: `http://localhost:8000`

### Frontend

```bash
cd frontend
npm run dev

# Или используйте скрипт
./start_frontend.sh
```

Frontend будет доступен по адресу: `http://localhost:5467`

## 📚 Структура проекта

```
zakup.one/
├── app/                    # Backend приложение
│   ├── api/               # API endpoints
│   ├── core/              # Конфигурация и БД
│   ├── models/            # Модели данных
│   └── services/          # Бизнес-логика
├── frontend/              # Frontend приложение
│   ├── src/
│   │   ├── api/          # API клиент
│   │   ├── components/   # React компоненты
│   │   ├── pages/        # Страницы
│   │   ├── store/        # Zustand stores
│   │   └── App.tsx       # Главный компонент
│   └── package.json
├── alembic/              # Миграции БД
├── requirements.txt      # Python зависимости
└── README.md
```

## 🔐 Аутентификация

### Регистрация пользователя
1. Перейдите на `/register`
2. Заполните форму регистрации
3. Дождитесь верификации администратором

### Вход в систему
- **Клиент:** `/login`
- **Админ:** `/login` (используйте данные администратора)

## 👨‍💼 Админ-панель

После входа как администратор, доступны следующие разделы:

- **Пользователи** - управление пользователями и верификация
- **Заявки** - просмотр и управление заявками от клиентов
- **Товары** - управление товарами, ценами, категориями
- **Прайс-листы** - загрузка и управление прайс-листами
  - **Управление** - подразделы:
    - Обновление прайс-листов (расписание)
    - Управление ценами (массовое изменение)
    - Управление контрагентами (доступ и права)
    - Управление поставщиками

## 📝 API Endpoints

### Аутентификация
- `POST /api/v1/auth/register` - регистрация
- `POST /api/v1/auth/login` - вход
- `GET /api/v1/auth/me` - текущий пользователь

### Товары
- `GET /api/v1/products/search?q=` - поиск товаров
- `GET /api/v1/products/{id}` - получить товар

### Заявки
- `GET /api/v1/orders` - список заявок пользователя
- `POST /api/v1/orders` - создать заявку
- `GET /api/v1/orders/{id}/tracking` - отслеживание доставки

### Админ API
- `GET /api/v1/admin/users` - список пользователей
- `POST /api/v1/admin/users/{id}/verify` - верификация
- `GET /api/v1/admin/orders` - все заявки
- `GET /api/v1/admin/products` - все товары
- `POST /api/v1/admin/import-price-list` - импорт прайс-листа
- `POST /api/v1/admin/products/bulk-update-prices` - массовое изменение цен

## 🗄️ База данных

### Основные таблицы
- `users` - пользователи системы
- `suppliers` - поставщики
- `products` - товары
- `orders` - заявки
- `order_items` - позиции в заявках
- `delivery_tracking` - отслеживание доставки
- `delivery_events` - события доставки

## 🔧 Разработка

### Миграции БД

```bash
# Создать новую миграцию
alembic revision --autogenerate -m "описание изменений"

# Применить миграции
alembic upgrade head

# Откатить миграцию
alembic downgrade -1
```

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/zakup_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
API_V1_PREFIX=/api/v1
```

## 📄 Лицензия

MIT

## 👥 Автор

AsanSh

## 🔗 Ссылки

- GitHub: https://github.com/AsanSh/zakup.one
- Backend API: http://localhost:8000/docs (Swagger UI)
- Frontend: http://localhost:5467
