# 🚨 Исправление: Открывается листинг директорий вместо приложения

## ❌ Проблема:
При открытии `zakup.one` показывается "Index of /" (листинг директорий) вместо frontend приложения.

**Это означает:**
- ❌ `.htaccess` не обрабатывается или не существует
- ❌ SPA routing не работает
- ❌ FastAPI не обрабатывает запросы

---

## ✅ РЕШЕНИЕ:

### ШАГ 1: Проверьте наличие .htaccess на сервере

На сервере выполните:
```bash
cd /home/kdlqemdxxn/zakup.one
ls -la .htaccess
```

**Если файл не существует:**
- Создайте его через File Manager
- Или загрузите через FTP

### ШАГ 2: Загрузите исправленный .htaccess

**Содержимое файла `.htaccess`:**

```apache
# Spaceship .htaccess configuration for zakup.one

# Enable rewrite engine
RewriteEngine On

# Disable directory browsing - КРИТИЧЕСКИ ВАЖНО!
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

# КРИТИЧЕСКИ ВАЖНО: Правило для /assets/ ПЕРВЫМ
RewriteCond %{REQUEST_URI} ^/assets/(.*)$ [NC]
RewriteCond %{DOCUMENT_ROOT}/frontend/dist/assets/%1 -f
RewriteRule ^assets/(.*)$ /frontend/dist/assets/$1 [L]

# Если файл не найден - 404
RewriteCond %{REQUEST_URI} ^/assets/ [NC]
RewriteRule ^(.*)$ - [R=404,L]

# Статические файлы с расширениями
RewriteCond %{REQUEST_URI} !^/assets/ [NC]
RewriteCond %{REQUEST_URI} \.(ico|txt|xml|json|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$ [NC]
RewriteCond %{REQUEST_URI} !^/api/ [NC]
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^(.*)$ - [L]

# API requests - proxy to Python backend
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^(.*)$ /wsgi.py/$1 [L]

# Frontend SPA routing - отдаем index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/assets/
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

### ШАГ 3: Проверьте настройки Spaceship

В панели Spaceship проверьте:

**Application settings:**
- **Application root**: `/home/kdlqemdxxn/zakup.one`
- **Application startup file**: `wsgi.py`
- **Application Entry point**: `application`
- **Python version**: `3.11`

**ВАЖНО:** Убедитесь что приложение запущено!

### ШАГ 4: Проверьте что FastAPI работает

На сервере выполните:
```bash
curl https://zakup.one/health
```

**Ожидаемый результат:**
```json
{"status":"ok","message":"API is running","frontend":"available"}
```

**Если не работает:**
- Проверьте логи в панели Spaceship
- Убедитесь что зависимости установлены
- Проверьте что `wsgi.py` существует

---

## 🔍 ДИАГНОСТИКА:

### Проверка 1: .htaccess существует?

```bash
cd /home/kdlqemdxxn/zakup.one
ls -la .htaccess
```

### Проверка 2: .htaccess обрабатывается?

```bash
# Проверьте что Apache/LiteSpeed обрабатывает .htaccess
# В панели Spaceship найдите настройки Apache/LiteSpeed
# Убедитесь что AllowOverride All включен
```

### Проверка 3: FastAPI запущен?

```bash
curl https://zakup.one/health
curl https://zakup.one/api/v1/health
```

### Проверка 4: frontend/dist существует?

```bash
ls -la /home/kdlqemdxxn/zakup.one/frontend/dist/index.html
```

---

## 🆘 Если .htaccess не работает:

### Вариант 1: Используйте конфигурацию LiteSpeed

Если сервер использует LiteSpeed (как видно из "Proudly Served by LiteSpeed"), возможно нужна другая конфигурация.

Создайте файл `.htaccess` с упрощенной версией:

```apache
RewriteEngine On
Options -Indexes

# Assets
RewriteCond %{REQUEST_URI} ^/assets/ [NC]
RewriteRule ^assets/(.*)$ /frontend/dist/assets/$1 [L]

# API
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^(.*)$ /wsgi.py/$1 [L]

# SPA
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/assets/
RewriteRule ^(.*)$ /frontend/dist/index.html [L]
```

### Вариант 2: Настройте через панель LiteSpeed

В панели управления LiteSpeed найдите настройки для домена `zakup.one` и настройте:
- Document Root: `/home/kdlqemdxxn/zakup.one`
- Index Files: `index.html`
- Enable Rewrite: `Yes`

---

## 📋 Чеклист:

- [ ] `.htaccess` существует на сервере
- [ ] `Options -Indexes` в `.htaccess` (отключает листинг)
- [ ] SPA routing правило в `.htaccess`
- [ ] FastAPI приложение запущено
- [ ] `frontend/dist/index.html` существует
- [ ] Настройки Spaceship правильные

---

**ГЛАВНОЕ: Создайте/загрузите `.htaccess` с `Options -Indexes` и SPA routing правилом!**

