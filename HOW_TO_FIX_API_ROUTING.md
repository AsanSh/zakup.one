# 🔧 КАК СДЕЛАТЬ ЧТОБЫ ЗАПРОСЫ ДОХОДИЛИ ДО FASTAPI

## ❌ Проблема
Запросы к `/api/v1/*` возвращают HTML 404 от LiteSpeed вместо JSON от FastAPI.

## ✅ Решение: 3 шага

### ШАГ 1: Проверить настройки Spaceship (КРИТИЧНО!)

В панели Spaceship для домена `zakup.one`:

1. **Откройте настройки Python приложения**
2. **Проверьте и установите:**

   - **Application root**: `/home/kdlqemdxxn/zakup.one`
     - ✅ Должен быть полный путь к корню проекта
   
   - **Startup file**: `wsgi.py`
     - ✅ Файл, который запускает приложение
   
   - **Entry point**: `application`
     - ⚠️ **КРИТИЧНО**: Должно быть `application` (БЕЗ `:`)
     - ❌ НЕ `wsgi:application`
     - ❌ НЕ `wsgi.application`
     - ✅ ТОЛЬКО `application`
   
   - **Python version**: `3.11`
     - ✅ Версия Python
   
   - **Status**: `Running`
     - ✅ Приложение должно быть запущено
     - Если `Stopped` - нажмите **START** или **RESTART**

3. **Сохраните настройки**

### ШАГ 2: Обновить `.htaccess` на сервере

**ВАЖНО**: Файл `.htaccess` должен быть в корне проекта: `/home/kdlqemdxxn/zakup.one/.htaccess`

#### Вариант A: Скопировать из репозитория

1. Скачайте `.htaccess` из репозитория GitHub
2. Загрузите на сервер через FTP/File Manager в `/home/kdlqemdxxn/zakup.one/.htaccess`
3. Установите права: `chmod 644 .htaccess`

#### Вариант B: Создать на сервере

Выполните на сервере:

```bash
cd /home/kdlqemdxxn/zakup.one
cat > .htaccess << 'ENDOFFILE'
# Spaceship .htaccess configuration for zakup.one
# ФИНАЛЬНАЯ ВЕРСИЯ для LiteSpeed Web Server + Python FastAPI

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

# ============================================
# КРИТИЧЕСКИ ВАЖНО: API endpoints ПЕРВЫМИ
# ============================================
# Все запросы к /api/* должны идти в Python приложение
# Для Spaceship/LiteSpeed используем формат без пути в RewriteRule
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^(.*)$ wsgi.py [E=REQUEST_URI:$1,L,QSA]

# Health endpoint тоже в Python
RewriteCond %{REQUEST_URI} ^/health$ [NC]
RewriteRule ^(.*)$ wsgi.py [E=REQUEST_URI:$1,L,QSA]

# ============================================
# Статические файлы
# ============================================

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

# ============================================
# Frontend SPA routing
# ============================================
# Отдаем index.html для всех остальных путей
# ВАЖНО: это должно быть ПОСЛЕДНИМ правилом
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/assets/
RewriteCond %{REQUEST_URI} !^/health
RewriteCond %{REQUEST_URI} !^/install\.php
RewriteRule ^(.*)$ /frontend/dist/index.html [L]

# ============================================
# Security headers
# ============================================
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Set default charset
AddDefaultCharset UTF-8
ENDOFFILE

chmod 644 .htaccess
```

### ШАГ 3: Перезапустить приложение

В панели Spaceship:

1. Найдите ваше Python приложение
2. Нажмите **STOP** (если запущено)
3. Подождите 5 секунд
4. Нажмите **START** или **RESTART**
5. Подождите 10-15 секунд
6. Проверьте что Status = `Running`

## 🧪 Проверка

### Проверка 1: Health endpoint

```bash
curl https://zakup.one/api/v1/health
```

**Ожидаемый результат:**
```json
{"status":"ok","database":"connected"}
```

**Если HTML 404:**
- Запросы все еще не доходят до FastAPI
- Проверьте настройки Spaceship еще раз
- Проверьте что `.htaccess` на месте

### Проверка 2: Login endpoint

```bash
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6#"
```

**Ожидаемый результат:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {...}
}
```

**Если HTML 404:**
- Проблема с проксированием `/api/*`
- Проверьте `.htaccess` правило для `/api/`

## 🔍 Диагностика

### Проверка 1: Файлы на месте?

```bash
cd /home/kdlqemdxxn/zakup.one
ls -la .htaccess
ls -la wsgi.py
ls -la app/main.py
```

Все файлы должны существовать.

### Проверка 2: wsgi.py правильный?

```bash
cat wsgi.py | grep -E "(from app.main import app|application = app)"
```

Должно показать:
```python
from app.main import app
application = app
```

### Проверка 3: Приложение запущено?

В панели Spaceship:
- Status должен быть `Running`
- Если `Stopped` - запустите!

### Проверка 4: Entry point правильный?

В панели Spaceship:
- Entry point должен быть `application`
- НЕ `wsgi:application`
- НЕ `wsgi.application`

## 🆘 Если все еще не работает

### Альтернативное решение: Упрощенный .htaccess

Если ничего не помогает, попробуйте минимальную версию:

```apache
RewriteEngine On
Options -Indexes

# Все запросы к Python (кроме статики)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/assets/
RewriteCond %{REQUEST_URI} !^/frontend/dist/
RewriteRule ^(.*)$ wsgi.py [L,QSA]

# Статика
RewriteCond %{REQUEST_URI} ^/assets/(.*)$ [NC]
RewriteCond %{DOCUMENT_ROOT}/frontend/dist/assets/%1 -f
RewriteRule ^assets/(.*)$ /frontend/dist/assets/$1 [L]

# SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /frontend/dist/index.html [L]
```

## 📋 Чеклист

- [ ] **Spaceship**: Application root = `/home/kdlqemdxxn/zakup.one`
- [ ] **Spaceship**: Startup file = `wsgi.py`
- [ ] **Spaceship**: Entry point = `application` (БЕЗ `:`)
- [ ] **Spaceship**: Status = `Running`
- [ ] **.htaccess**: Находится в `/home/kdlqemdxxn/zakup.one/.htaccess`
- [ ] **.htaccess**: Содержит правило для `/api/*` → `wsgi.py`
- [ ] **wsgi.py**: Содержит `application = app`
- [ ] **Проверка**: `curl https://zakup.one/api/v1/health` возвращает JSON

## 🎯 Главное

**90% проблем решается правильной настройкой Spaceship:**

1. ✅ Entry point = `application` (не `wsgi:application`)
2. ✅ Status = `Running`
3. ✅ `.htaccess` правильно настроен

**После исправления этих пунктов запросы должны доходить до FastAPI!**

