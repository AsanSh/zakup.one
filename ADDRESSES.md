# Адреса приложения ZAKUP.ONE

## ⚠️ ВАЖНО: Frontend и Backend на разных портах!

### Frontend (React приложение) - ОСНОВНОЙ ИНТЕРФЕЙС
**Откройте этот адрес для работы с приложением:**

- **Клиентский интерфейс:** http://localhost:5173/customer
- **Админ-панель:** http://localhost:5173/admin
- **Страница входа:** http://localhost:5173/login

### Backend (Django API) - ТОЛЬКО ДЛЯ API
**Это JSON API, не интерфейс приложения:**

- **API корень:** http://localhost:8000
- **Django Admin:** http://localhost:8000/admin
- **API эндпоинты:** http://localhost:8000/api/...

## Как открыть приложение:

1. **Откройте в браузере:** http://localhost:5173/login
2. Войдите с учетными данными
3. После входа вы будете перенаправлены:
   - Клиенты → http://localhost:5173/customer
   - Админы → http://localhost:5173/admin

## Если видите JSON вместо интерфейса:

Вы открыли **backend** (localhost:8000) вместо **frontend** (localhost:5173).

**Правильный адрес:** http://localhost:5173/login


