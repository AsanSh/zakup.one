# 📊 АНАЛИЗ API РОУТОВ

## ✅ Блок 1: Backend роуты

### Структура роутов:

1. **Файл**: `app/api/v1/endpoints/auth.py`
   - **APIRouter**: `router = APIRouter()`
   - **Endpoint**: `@router.post("/login")`
   - **Локальный путь**: `/login`

2. **Файл**: `app/api/v1/api.py`
   - **Подключение**: `api_router.include_router(auth.router, prefix="/auth")`
   - **Prefix роутера**: `/auth`
   - **Итоговый путь в api_router**: `/auth/login`

3. **Файл**: `app/main.py`
   - **Подключение**: `app.include_router(api_router, prefix=settings.API_V1_PREFIX)`
   - **API_V1_PREFIX**: `/api/v1` (из `app/core/config.py`)

### ✅ ИТОГОВЫЙ URL ЛОГИНА В BACKEND:
```
/api/v1/auth/login
```

---

## ✅ Блок 2: Frontend вызовы

### Файлы API клиента:

1. **Файл**: `frontend/src/shared/api/authApi.ts`
   - **Base URL**: `const API_URL = import.meta.env.VITE_API_URL || '/api/v1'`
   - **Вызов логина**: `${API_URL}/auth/login`
   - **Итоговый URL**: `/api/v1/auth/login`

2. **Файл**: `frontend/src/shared/api/axiosConfig.ts`
   - **Base URL**: `const API_URL = import.meta.env.VITE_API_URL || '/api/v1'`
   - **axios.create({ baseURL: API_URL })`

### ✅ ИТОГОВЫЙ URL ЛОГИНА В FRONTEND:
```
/api/v1/auth/login
```

---

## ✅ ВЫВОД: Пути совпадают!

**Backend**: `/api/v1/auth/login`  
**Frontend**: `/api/v1/auth/login`  
**Статус**: ✅ **СОВПАДАЮТ**

---

## ❌ Проблема: `.htaccess` не проксирует запросы

Запросы к `/api/v1/*` не доходят до FastAPI, возвращается HTML 404 от LiteSpeed.

**Решение**: Исправить `.htaccess` для правильного проксирования к `wsgi.py`.

