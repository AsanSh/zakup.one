# Быстрый старт ZAKUP.ONE

## Запуск проекта

### 1. Backend (FastAPI)

```bash
# Активируйте виртуальное окружение
source venv/bin/activate  # или python3 -m venv venv && source venv/bin/activate

# Установите зависимости
pip install -r requirements.txt

# Убедитесь что PostgreSQL запущен и база данных создана
# Проверьте настройки в .env файле:
# DATABASE_URL=postgresql://user:password@localhost:5432/zakup_db

# Запустите сервер
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend будет доступен на: http://localhost:8000
API документация: http://localhost:8000/api/docs

### 2. Frontend (React + Vite)

```bash
cd frontend

# Установите зависимости (если еще не установлены)
npm install

# Запустите dev сервер
npm run dev
```

Frontend будет доступен на: http://localhost:5467

## Учетные данные

### Администратор
- Email: `admin@zakup.one`
- Пароль: `admin123`

### Тестовый клиент
- Создайте через форму регистрации
- После регистрации администратор должен одобрить заявку

## Проверка работоспособности

1. **Backend:**
   ```bash
   curl http://localhost:8000/health
   # Должен вернуть: {"status":"ok"}
   ```

2. **Frontend:**
   - Откройте http://localhost:5467
   - Должна открыться страница логина
   - Войдите как администратор
   - Должна открыться админ-панель

3. **API:**
   - Откройте http://localhost:8000/api/docs
   - Должна открыться Swagger документация

## Решение проблем

### Проблема: "База данных недоступна"
**Решение:**
1. Убедитесь что PostgreSQL запущен
2. Проверьте настройки в `.env` файле
3. Создайте базу данных: `createdb zakup_db`

### Проблема: "Долго грузится"
**Решение:**
1. Проверьте что backend запущен на порту 8000
2. Проверьте консоль браузера на ошибки
3. Очистите localStorage: `localStorage.clear()`

### Проблема: "401 Unauthorized"
**Решение:**
1. Выйдите и войдите снова
2. Проверьте что токен сохраняется в localStorage
3. Проверьте что backend возвращает правильный токен

## Структура проекта

```
webscrp/
├── app/                    # Backend (FastAPI)
│   ├── api/v1/endpoints/   # API endpoints
│   ├── core/               # Конфигурация
│   ├── models/             # Модели БД
│   └── services/           # Бизнес-логика
├── frontend/               # Frontend (React)
│   ├── src/
│   │   ├── admin/          # Админ-панель
│   │   ├── client/         # Клиентская часть
│   │   └── shared/         # Общие компоненты
│   └── package.json
├── requirements.txt        # Python зависимости
└── .env                    # Настройки окружения
```

## Следующие шаги

1. Настройте email в `.env` для уведомлений
2. Загрузите прайс-листы через админ-панель
3. Создайте тестовых клиентов
4. Протестируйте весь функционал

