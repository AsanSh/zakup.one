# 🚀 Упрощенное развертывание на Spaceship

## ✅ Что готово:

1. ✅ **Frontend собран** - `frontend/dist/` существует
2. ✅ **Упрощенная версия backend** - `app/main_simple.py` (без сложных зависимостей)
3. ✅ **Упрощенный WSGI** - `wsgi_simple.py` (с диагностикой)
4. ✅ **Минимальные зависимости** - `requirements_simple.txt`

## 📋 Быстрый старт:

### Шаг 1: Загрузите файлы на сервер

Через панель Spaceship File Manager загрузите:

**Обязательные файлы:**
- `app/main_simple.py` → переименуйте в `app/main.py` (или используйте как есть)
- `wsgi_simple.py` → переименуйте в `wsgi.py` (или используйте как есть)
- `requirements_simple.txt` → переименуйте в `requirements.txt`
- `frontend/dist/` → вся папка с собранным frontend

### Шаг 2: Настройте Spaceship

В панели Spaceship:

**Application settings:**
- Application root: `/home/kdlqemdxxn/zakup.one`
- Application startup file: `wsgi.py` (или `wsgi_simple.py`)
- Application Entry point: `application`
- Python version: `3.11`

**Environment variables:**
- `DEBUG` = `True` (для начала)

### Шаг 3: Установите зависимости

**Вариант A: Через панель**
- Найдите `requirements.txt` в "Configuration files"
- Нажмите "Run Pip Install"

**Вариант B: Через SSH**
```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip install -r requirements.txt
```

### Шаг 4: Проверка

После установки проверьте:

1. **Health check:**
   ```
   https://zakup.one/health
   ```
   Ожидаемый ответ: `{"status": "ok", "service": "zakup.one"}`

2. **API health:**
   ```
   https://zakup.one/api/v1/health
   ```
   Ожидаемый ответ: `{"status": "ok", "api": "v1"}`

3. **Frontend:**
   ```
   https://zakup.one
   ```
   Должен открыться интерфейс

4. **API login (mock):**
   ```
   POST https://zakup.one/api/v1/auth/login
   Body: {"email": "test@test.com", "password": "any"}
   ```
   Вернет mock токен и пользователя

## 🔄 Переключение между версиями:

### Использовать упрощенную версию:

1. Переименуйте файлы:
   ```bash
   mv app/main.py app/main_full.py
   mv app/main_simple.py app/main.py
   mv wsgi.py wsgi_full.py
   mv wsgi_simple.py wsgi.py
   mv requirements.txt requirements_full.txt
   mv requirements_simple.txt requirements.txt
   ```

2. Переустановите зависимости:
   ```bash
   pip install -r requirements.txt
   ```

### Вернуться к полной версии:

1. Переименуйте обратно:
   ```bash
   mv app/main.py app/main_simple.py
   mv app/main_full.py app/main.py
   mv wsgi.py wsgi_simple.py
   mv wsgi_full.py wsgi.py
   mv requirements.txt requirements_simple.txt
   mv requirements_full.txt requirements.txt
   ```

2. Переустановите зависимости:
   ```bash
   pip install -r requirements.txt
   ```

## 📝 Что включено в упрощенную версию:

### Backend (`app/main_simple.py`):
- ✅ FastAPI приложение
- ✅ CORS middleware
- ✅ Статические файлы frontend
- ✅ SPA routing
- ✅ Mock API endpoints:
  - `/api/v1/auth/login` - авторизация (mock)
  - `/api/v1/products` - список товаров (mock)
  - `/api/v1/users/me` - текущий пользователь (mock)
  - `/health` - health check
  - `/api/v1/health` - API health check

### Зависимости (`requirements_simple.txt`):
- `fastapi==0.104.1` - веб-фреймворк
- `uvicorn[standard]==0.24.0` - ASGI сервер
- `python-multipart==0.0.6` - для загрузки файлов
- `python-dotenv==1.0.0` - для .env файлов

**Всего 4 пакета вместо 20+!**

## ⚠️ Важные замечания:

1. **Mock данные** - упрощенная версия использует mock данные, не подключается к БД
2. **Без аутентификации** - токены генерируются, но не проверяются
3. **Без БД** - все данные в памяти, не сохраняются
4. **Для тестирования** - используйте для проверки работы frontend и базовой функциональности

## 🎯 Следующие шаги:

После успешного запуска упрощенной версии:

1. Убедитесь что frontend работает
2. Проверьте все API endpoints
3. Если все ОК - переключитесь на полную версию с БД

## 🆘 Устранение проблем:

### Если ошибка 500:

1. Проверьте логи в панели Spaceship
2. Убедитесь что зависимости установлены
3. Проверьте что `wsgi.py` указывает на правильный файл
4. Включите `DEBUG=True` для подробных ошибок

### Если frontend не загружается:

1. Проверьте что `frontend/dist/index.html` существует
2. Проверьте права доступа к файлам
3. Проверьте настройки в `.htaccess`

### Если API не работает:

1. Проверьте что `app/main.py` (или `app/main_simple.py`) существует
2. Проверьте логи для ошибок импорта
3. Убедитесь что все зависимости установлены

