# 🔧 Исправление ошибок MIME типов для статических файлов

## ❌ Проблема:
Статические файлы (CSS, JS) возвращаются с неправильным MIME типом `text/html` вместо:
- `text/css` для CSS файлов
- `application/javascript` для JS файлов

## ✅ Решение:
Исправлен `.htaccess` файл для правильной обработки статических файлов.

---

## 📋 Что нужно сделать:

### ШАГ 1: Загрузите исправленный .htaccess

1. **Откройте File Manager** в панели Spaceship
2. **Перейдите в** `/home/kdlqemdxxn/zakup.one/`
3. **Найдите файл** `.htaccess`
4. **Откройте для редактирования**
5. **Замените содержимое** на исправленную версию (см. ниже)

### ШАГ 2: Или загрузите файл через FTP

Загрузите обновленный `.htaccess` файл на сервер.

---

## 📝 Исправленный .htaccess:

```apache
# Spaceship .htaccess configuration for zakup.one

# Enable rewrite engine
RewriteEngine On

# Allow direct access to install.php
RewriteCond %{REQUEST_URI} ^/install\.php$ [NC]
RewriteRule ^(.*)$ - [L]

# Static files - serve directly (favicon.ico, robots.txt, etc.)
RewriteCond %{REQUEST_URI} \.(ico|txt|xml|json|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$ [NC]
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^(.*)$ - [L]

# Frontend static files from dist/assets - serve directly from filesystem
RewriteCond %{REQUEST_URI} ^/assets/ [NC]
RewriteCond %{DOCUMENT_ROOT}/frontend/dist%{REQUEST_URI} -f
RewriteRule ^(.*)$ /frontend/dist%{REQUEST_URI} [L]

# If assets file not found in filesystem, proxy to Python (FastAPI will handle it)
RewriteCond %{REQUEST_URI} ^/assets/ [NC]
RewriteRule ^(.*)$ /wsgi.py/$1 [L]

# API requests - proxy to Python backend
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^(.*)$ /wsgi.py/$1 [L]

# Frontend static files - serve from dist directory (SPA routing)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/assets/
RewriteRule ^(.*)$ /frontend/dist/index.html [L]

# MIME types for static files
<IfModule mod_mime.c>
    AddType text/css .css
    AddType application/javascript .js
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

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Disable directory browsing
Options -Indexes

# Set default charset
AddDefaultCharset UTF-8
```

---

## 🔑 Ключевые изменения:

1. **Правильная обработка `/assets/`:**
   - Сначала проверяем существование файла в `/frontend/dist/assets/`
   - Если файл существует - отдаем его напрямую
   - Если нет - проксируем к Python (FastAPI)

2. **Добавлены MIME типы:**
   - `text/css` для `.css` файлов
   - `application/javascript` для `.js` файлов
   - И другие типы для изображений и шрифтов

3. **Исключен `/assets/` из SPA routing:**
   - Добавлено условие `RewriteCond %{REQUEST_URI} !^/assets/`
   - Чтобы `/assets/` не попадал в правило для `index.html`

---

## ✅ Проверка после исправления:

1. **Очистите кеш браузера:**
   - `Ctrl+Shift+R` (Windows/Linux)
   - `Cmd+Shift+R` (Mac)

2. **Откройте консоль разработчика:**
   - `F12` или `Ctrl+Shift+I`

3. **Проверьте что ошибки исчезли:**
   - Не должно быть ошибок MIME типов
   - CSS и JS файлы должны загружаться правильно

4. **Проверьте Network tab:**
   - Откройте вкладку "Network"
   - Обновите страницу
   - Проверьте что файлы из `/assets/` имеют правильные MIME типы:
     - CSS файлы: `text/css`
     - JS файлы: `application/javascript`

---

## 🆘 Если проблема осталась:

### Вариант 1: Проверьте путь к файлам

Убедитесь что файлы находятся в:
```
/home/kdlqemdxxn/zakup.one/frontend/dist/assets/
```

### Вариант 2: Проверьте права доступа

```bash
chmod 644 /home/kdlqemdxxn/zakup.one/.htaccess
chmod -R 755 /home/kdlqemdxxn/zakup.one/frontend/dist
```

### Вариант 3: Проверьте что FastAPI правильно монтирует `/assets/`

В `app/main.py` должно быть:
```python
app.mount("/assets", StaticFiles(directory=str(frontend_assets)), name="assets")
```

---

## 📋 Чеклист:

- [ ] Загружен исправленный `.htaccess`
- [ ] Очищен кеш браузера
- [ ] Проверена консоль - нет ошибок MIME типов
- [ ] CSS файлы загружаются с типом `text/css`
- [ ] JS файлы загружаются с типом `application/javascript`
- [ ] Frontend отображается правильно

---

**После применения исправления ошибки MIME типов должны исчезнуть! 🚀**

