# Исправления проблем с авторизацией

## ✅ Исправленные проблемы

### 1. Улучшена обработка ошибок в authApi
**Файл:** `frontend/src/shared/api/authApi.ts`

**Изменения:**
- Добавлен try-catch с подробным логированием
- Добавлен `withCredentials: true` для поддержки cookies
- Улучшена обработка ошибок с детальной информацией

### 2. Улучшена конфигурация CORS
**Файл:** `app/main.py`

**Изменения:**
- Добавлен `expose_headers=["*"]` для доступа к заголовкам ответа
- Уточнены методы: `["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]`

**Файл:** `app/core/config.py`

**Изменения:**
- Добавлены дополнительные CORS origins:
  - `http://127.0.0.1:5467`
  - `http://127.0.0.1:8000`

### 3. Улучшена конфигурация Vite proxy
**Файл:** `frontend/vite.config.ts`

**Изменения:**
- Добавлен `secure: false` для локальной разработки
- Добавлен `ws: true` для поддержки WebSocket

## 🔍 Отладка

### Проверка в браузере

1. **Откройте DevTools (F12)**
2. **Перейдите на вкладку Console**
3. **Попробуйте войти** с данными:
   - Email: `admin@zakup.one`
   - Пароль: `admin123`
4. **Проверьте логи:**
   - `Sending login request to: /api/v1/auth/login`
   - `Login response: { status: 200, hasToken: true, user: {...} }`

### Проверка Network запросов

1. **Откройте DevTools (F12)**
2. **Перейдите на вкладку Network**
3. **Попробуйте войти**
4. **Проверьте запрос `/api/v1/auth/login`:**
   - Status: `200 OK`
   - Response содержит `access_token` и `user`
   - Headers содержат правильные CORS заголовки

### Проверка CORS

В ответе сервера должны быть заголовки:
```
Access-Control-Allow-Origin: http://localhost:5467
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: *
```

## 🚀 Запуск

### Backend
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
cd frontend
npm run dev
```

## 📋 Проверка работоспособности

1. ✅ Backend запущен на http://localhost:8000
2. ✅ Frontend запущен на http://localhost:5467
3. ✅ API доступен на http://localhost:8000/api/v1
4. ✅ CORS настроен правильно
5. ✅ Логирование работает в консоли браузера

## 🔧 Если проблемы остаются

1. **Очистите localStorage:**
   ```javascript
   localStorage.clear()
   ```

2. **Проверьте, что backend запущен:**
   ```bash
   curl http://localhost:8000/health
   ```

3. **Проверьте CORS в Network:**
   - Откройте DevTools → Network
   - Найдите запрос `/api/v1/auth/login`
   - Проверьте заголовки ответа

4. **Проверьте консоль браузера:**
   - Должны быть логи: `Sending login request...`
   - Должны быть логи: `Login response: {...}`

## 📝 Примечания

- Все endpoints используют правильный путь: `/api/v1/auth/login`
- Используется Zustand (не Redux) для state management
- Backend - FastAPI (Python), не Express.js
- CORS настроен для порта 5467 (frontend) и 8000 (backend)

