# Инструкция по перезапуску проекта ZAKUP.ONE

## Быстрый перезапуск

### 1. Остановка всех процессов

```bash
# Остановить backend
pkill -f "uvicorn"

# Остановить frontend
pkill -f "vite"
```

### 2. Запуск Backend

```bash
cd /Users/asanshirgebaev/Documents/Private/Проги/webscrp
./start_backend.sh
```

Или вручную:
```bash
cd /Users/asanshirgebaev/Documents/Private/Проги/webscrp

# Создать виртуальное окружение (если еще не создано)
python3 -m venv venv
source venv/bin/activate

# Установить зависимости
pip install -r requirements.txt

# Запустить сервер
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend будет доступен на: http://localhost:8000
API документация: http://localhost:8000/api/docs

### 3. Запуск Frontend

В новом терминале:
```bash
cd /Users/asanshirgebaev/Documents/Private/Проги/webscrp/frontend
./start_frontend.sh
```

Или вручную:
```bash
cd /Users/asanshirgebaev/Documents/Private/Проги/webscrp/frontend

# Установить зависимости (если еще не установлены)
npm install

# Запустить dev сервер
npm run dev
```

Frontend будет доступен на: http://localhost:5467

## Проверка работы

1. **Backend**: Откройте http://localhost:8000/api/docs - должна открыться документация API
2. **Frontend**: Откройте http://localhost:5467 - должна открыться страница входа

## Учетные данные администратора

- Email: `admin@zakup.one`
- Пароль: `admin123`

## Решение проблем

### Backend не запускается

1. Проверьте, что PostgreSQL запущен и база данных создана
2. Проверьте файл `.env` с настройками базы данных
3. Убедитесь, что все зависимости установлены: `pip install -r requirements.txt`

### Frontend не запускается

1. Убедитесь, что Node.js установлен: `node --version`
2. Установите зависимости: `npm install`
3. Проверьте, что порт 5467 свободен

### Ошибки подключения к базе данных

1. Проверьте настройки в `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/zakup_db
   ```
2. Убедитесь, что PostgreSQL запущен
3. Проверьте, что база данных `zakup_db` создана

### Ошибки импорта модулей

1. Убедитесь, что виртуальное окружение активировано: `source venv/bin/activate`
2. Переустановите зависимости: `pip install -r requirements.txt`

## Структура проекта

```
webscrp/
├── app/                    # Backend (FastAPI)
│   ├── api/                # API endpoints
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
├── start_backend.sh        # Скрипт запуска backend
└── start_frontend.sh       # Скрипт запуска frontend
```

