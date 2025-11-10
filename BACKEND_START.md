# Запуск Backend

## Проблема: Backend не запускается

Если вы видите ошибку `ECONNREFUSED` или `500 Internal Server Error`, это означает, что backend не запущен.

## Решение

### 1. Установите зависимости (если еще не установлены)

```bash
cd /Users/asanshirgebaev/Documents/Private/Проги/webscrp
pip install -r requirements.txt
```

### 2. Настройте базу данных

Создайте файл `.env` (если его нет):

```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите правильные данные для PostgreSQL:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/zakup_db
```

### 3. Запустите backend

**Вариант 1: Через скрипт**
```bash
./start-backend.sh
```

**Вариант 2: Вручную**
```bash
python3 run.py
```

Backend будет доступен на: **http://localhost:8000**

### 4. Проверьте, что backend работает

Откройте в браузере:
- http://localhost:8000/health - должен вернуть `{"status": "ok"}`
- http://localhost:8000/api/docs - API документация

## Важно

⚠️ **Backend должен быть запущен ДО того, как вы откроете фронтенд!**

1. Сначала запустите backend: `python3 run.py`
2. Затем запустите frontend: `cd frontend && npm run dev`
3. Откройте http://localhost:5467

## Проверка статуса

```bash
# Проверить, запущен ли backend
lsof -ti:8000 && echo "✅ Backend запущен" || echo "❌ Backend не запущен"

# Проверить ответ backend
curl http://localhost:8000/health
```

