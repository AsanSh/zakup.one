# 🚨 Исправление ошибки 403 Forbidden

## ❌ Проблема:
После загрузки `.htaccess` появилась ошибка **403 Forbidden**.

**Это означает:**
- ✅ `.htaccess` работает (листинг директорий отключен)
- ❌ Но доступ к файлам запрещен (права доступа или конфигурация)

---

## ✅ РЕШЕНИЕ:

### ШАГ 1: Проверьте права доступа к файлам

На сервере выполните:

```bash
cd /home/kdlqemdxxn/zakup.one

# Права на директории
chmod 755 .
chmod 755 frontend
chmod 755 frontend/dist
chmod 755 frontend/dist/assets

# Права на файлы
chmod 644 .htaccess
chmod 644 frontend/dist/index.html
chmod 644 frontend/dist/assets/*
chmod 644 wsgi.py
chmod 644 requirements.txt

# Права на app директорию
chmod 755 app
find app -type d -exec chmod 755 {} \;
find app -type f -exec chmod 644 {} \;
```

### ШАГ 2: Проверьте что файлы существуют

```bash
# Проверьте index.html
ls -la /home/kdlqemdxxn/zakup.one/frontend/dist/index.html

# Проверьте assets
ls -la /home/kdlqemdxxn/zakup.one/frontend/dist/assets/ | head -5
```

### ШАГ 3: Исправьте .htaccess

Возможно проблема в правиле для `/assets/`. Попробуйте упрощенную версию:

```apache
# Spaceship .htaccess configuration for zakup.one

RewriteEngine On

# Disable directory browsing
Options -Indexes

# MIME types
<IfModule mod_mime.c>
    AddType text/css .css
    AddType application/javascript .js
    AddType text/javascript .js
</IfModule>

# Assets - упрощенное правило
RewriteCond %{REQUEST_URI} ^/assets/ [NC]
RewriteRule ^assets/(.*)$ /frontend/dist/assets/$1 [L]

# API
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^(.*)$ /wsgi.py/$1 [L]

# SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/assets/
RewriteRule ^(.*)$ /frontend/dist/index.html [L]
```

### ШАГ 4: Проверьте DOCUMENT_ROOT

Возможно `%{DOCUMENT_ROOT}` указывает не туда. Попробуйте использовать полный путь:

```apache
# Вместо %{DOCUMENT_ROOT}/frontend/dist/assets/%1
# Используйте:
RewriteCond /home/kdlqemdxxn/zakup.one/frontend/dist/assets/%1 -f
```

---

## 🔍 ДИАГНОСТИКА:

### Проверка 1: Права доступа

```bash
cd /home/kdlqemdxxn/zakup.one
ls -la frontend/dist/index.html
# Должно быть: -rw-r--r--
```

### Проверка 2: Доступность файла напрямую

```bash
# Проверьте что файл читается
cat /home/kdlqemdxxn/zakup.one/frontend/dist/index.html | head -5
```

### Проверка 3: Проверьте через URL

```bash
# Попробуйте открыть напрямую
curl https://zakup.one/frontend/dist/index.html
```

Если это работает, но `https://zakup.one/` не работает → проблема в `.htaccess` routing.

---

## 🆘 Если все еще 403:

### Вариант 1: Временно упростите .htaccess

Создайте минимальный `.htaccess`:

```apache
RewriteEngine On
Options -Indexes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /frontend/dist/index.html [L]
```

### Вариант 2: Проверьте настройки LiteSpeed

В панели LiteSpeed найдите настройки для `zakup.one`:
- **Document Root**: `/home/kdlqemdxxn/zakup.one`
- **Index Files**: `index.html`
- **Follow Symbolic Links**: `Yes`
- **Enable Rewrite**: `Yes`

### Вариант 3: Проверьте что FastAPI обрабатывает запросы

```bash
curl https://zakup.one/health
```

Если это работает → проблема в `.htaccess` routing.
Если не работает → проблема в FastAPI/wsgi.py.

---

## 📋 Чеклист:

- [ ] Права доступа правильные (755 для директорий, 644 для файлов)
- [ ] `frontend/dist/index.html` существует и читается
- [ ] `.htaccess` содержит SPA routing правило
- [ ] FastAPI приложение запущено
- [ ] `/health` endpoint работает

---

**ГЛАВНОЕ: Проверьте права доступа к файлам!**

