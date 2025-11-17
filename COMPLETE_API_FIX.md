# 🔧 ПОЛНОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМЫ С API И ЛОГИНОМ

## 🎯 Проблема

1. **API возвращает 404** - запросы к `/api/v1/health` и `/api/v1/auth/login` не доходят до FastAPI
2. **"Токен не получен от сервера"** - из-за того что API не работает

## 🔍 Анализ

### Проблема 1: `.htaccess` неправильно настроен для LiteSpeed

Текущее правило:
```apache
RewriteRule ^(.*)$ /wsgi.py/$1 [L]
```

**Проблема**: LiteSpeed не понимает такой формат. Нужно использовать другой подход.

### Проблема 2: Структура API

- API префикс: `/api/v1`
- Auth endpoint: `/api/v1/auth/login`
- Health endpoint: `/api/v1/health`

Все правильно настроено в коде, но `.htaccess` не проксирует запросы.

## ✅ Решение

### Шаг 1: Исправить `.htaccess`

Замените содержимое `.htaccess` на:

```apache
# Spaceship .htaccess configuration for zakup.one
# Версия для LiteSpeed Web Server с Python

# Enable rewrite engine
RewriteEngine On

# Disable directory browsing
Options -Indexes

# Allow direct access to install.php
RewriteCond %{REQUEST_URI} ^/install\.php$ [NC]
RewriteRule ^(.*)$ - [L]

# MIME types for static files
<IfModule mod_mime.c>
    AddType text/css .css
    AddType application/javascript .js
    AddType text/javascript .js
    AddType application/json .json
    AddType image/svg+xml .svg
    AddType image/png .png
    AddType image/jpeg .jpg .jpeg
    AddType image/gif .gif
    AddType image/x-icon .ico
    AddType font/woff .woff
    AddType font/woff2 .woff2
    AddType font/ttf .ttf
    AddType font/eot .eot
</IfModule>

# КРИТИЧЕСКИ ВАЖНО: API и Health endpoints ПЕРВЫМИ
# Для LiteSpeed с Python нужно использовать специальный формат
# Все запросы к /api/ и /health должны идти к wsgi.py
RewriteCond %{REQUEST_URI} ^/api/ [NC,OR]
RewriteCond %{REQUEST_URI} ^/health$ [NC]
RewriteRule ^(.*)$ wsgi.py/$1 [E=REQUEST_URI:$1,L]

# Assets - обслуживаем напрямую из файловой системы
RewriteCond %{REQUEST_URI} ^/assets/(.*)$ [NC]
RewriteCond %{DOCUMENT_ROOT}/frontend/dist/assets/%1 -f
RewriteRule ^assets/(.*)$ /frontend/dist/assets/$1 [L]

# Статические файлы с расширениями - обслуживаем напрямую
RewriteCond %{REQUEST_URI} !^/assets/ [NC]
RewriteCond %{REQUEST_URI} !^/api/ [NC]
RewriteCond %{REQUEST_URI} !^/health [NC]
RewriteCond %{REQUEST_URI} \.(ico|txt|xml|json|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$ [NC]
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^(.*)$ - [L]

# Frontend SPA routing - отдаем index.html для всех остальных путей
# ВАЖНО: это должно быть ПОСЛЕДНИМ правилом
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/assets/
RewriteCond %{REQUEST_URI} !^/health
RewriteCond %{REQUEST_URI} !^/install\.php
RewriteRule ^(.*)$ /frontend/dist/index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Set default charset
AddDefaultCharset UTF-8
```

**Ключевое изменение**: 
```apache
RewriteRule ^(.*)$ wsgi.py/$1 [E=REQUEST_URI:$1,L]
```

Убрал `/` перед `wsgi.py` - для LiteSpeed это важно!

### Шаг 2: Проверить настройки Spaceship

В панели Spaceship убедитесь что:

1. **Application root**: `/home/kdlqemdxxn/zakup.one`
2. **Startup file**: `wsgi.py`
3. **Entry point**: `application`
4. **Python version**: `3.11`
5. **Status**: `Running`

### Шаг 3: Создать пользователя в базе

Выполните на сервере:

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python create_superadmin.py
```

Или создайте пользователя вручную через скрипт:

```python
# create_user.py
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import SessionLocal
from app.models.user import User
from app.api.v1.endpoints.auth import get_password_hash

db = SessionLocal()
user = User(
    email="asannameg@gmail.com",
    full_name="asannameg",
    company="ZAKUP.ONE",
    hashed_password=get_password_hash("ParolJok6#"),
    is_admin=True,
    is_verified=True,
    is_active=True
)
db.add(user)
db.commit()
print(f"✅ User created: {user.email}")
```

### Шаг 4: Проверить API напрямую

```bash
# Проверка health endpoint
curl -v https://zakup.one/api/v1/health

# Проверка login endpoint
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6#"
```

### Шаг 5: Проверить логи

```bash
# Логи приложения (если есть)
tail -f /var/log/lsws/error.log
tail -f /home/kdlqemdxxn/zakup.one/app.log
```

## 🧪 Диагностика

Создайте файл `test_api.py` на сервере:

```python
#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from app.main import app
    print("✅ App imported successfully")
    
    # Проверяем роутеры
    routes = [r.path for r in app.routes]
    print(f"✅ Found {len(routes)} routes")
    
    # Проверяем API routes
    api_routes = [r for r in routes if r.startswith("/api")]
    print(f"✅ API routes: {api_routes}")
    
    # Проверяем health
    if "/api/v1/health" in routes:
        print("✅ /api/v1/health route exists")
    else:
        print("❌ /api/v1/health route NOT found")
        
    if "/api/v1/auth/login" in routes:
        print("✅ /api/v1/auth/login route exists")
    else:
        print("❌ /api/v1/auth/login route NOT found")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
```

Запустите:
```bash
python test_api.py
```

## 📋 Чеклист исправления

- [ ] Обновлен `.htaccess` с правильным форматом для LiteSpeed
- [ ] Проверены настройки Spaceship (Application root, Entry point)
- [ ] Создан пользователь в базе данных
- [ ] Проверен health endpoint через curl
- [ ] Проверен login endpoint через curl
- [ ] Перезапущено приложение в Spaceship
- [ ] Проверены логи на наличие ошибок
- [ ] Обновлен frontend/dist на сервере

## 🚨 Если все еще не работает

1. **Проверьте что Python приложение запущено**:
   - В панели Spaceship должно быть "Running"
   - Если нет - перезапустите

2. **Проверьте права доступа**:
   ```bash
   chmod 755 /home/kdlqemdxxn/zakup.one
   chmod 644 /home/kdlqemdxxn/zakup.one/.htaccess
   chmod 755 /home/kdlqemdxxn/zakup.one/wsgi.py
   ```

3. **Проверьте что все файлы на месте**:
   ```bash
   ls -la /home/kdlqemdxxn/zakup.one/wsgi.py
   ls -la /home/kdlqemdxxn/zakup.one/app/main.py
   ls -la /home/kdlqemdxxn/zakup.one/.env
   ```

4. **Проверьте подключение к базе данных**:
   ```bash
   python -c "from app.core.database import SessionLocal; db = SessionLocal(); print('✅ DB connected')"
   ```

## 📝 Примечания

- LiteSpeed требует специального формата для проксирования к Python
- Убедитесь что в Spaceship правильно указан Entry point: `application`
- Все запросы к `/api/*` должны проксироваться к `wsgi.py`
- Frontend должен быть собран и загружен в `frontend/dist/`

