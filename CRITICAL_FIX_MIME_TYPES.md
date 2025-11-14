# 🚨 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Статические файлы возвращают text/html

## ❌ Проблема:
Все статические файлы (`/assets/*.css`, `/assets/*.js`) возвращаются с MIME типом `text/html` вместо:
- `text/css` для CSS
- `application/javascript` для JS

**Это означает:** Запросы к `/assets/` попадают в SPA routing и возвращают `index.html`!

---

## ✅ РЕШЕНИЕ: Исправленный .htaccess

### КРИТИЧЕСКИ ВАЖНО: Загрузите исправленный `.htaccess` на сервер!

**Что изменено:**
1. Правило для `/assets/` теперь ПЕРВОЕ (после MIME типов)
2. Если файл не найден - возвращается 404, а не проксирование к Python
3. `/assets/` явно исключен из SPA routing

---

## 📝 ИСПРАВЛЕННЫЙ .htaccess:

**ЗАМЕНИТЕ ВЕСЬ ФАЙЛ на сервере:**

```apache
# Spaceship .htaccess configuration for zakup.one

# Enable rewrite engine
RewriteEngine On

# Allow direct access to install.php
RewriteCond %{REQUEST_URI} ^/install\.php$ [NC]
RewriteRule ^(.*)$ - [L]

# MIME types for static files - КРИТИЧЕСКИ ВАЖНО: должно быть ПЕРВЫМ
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

# КРИТИЧЕСКИ ВАЖНО: Правило для /assets/ должно быть ПЕРВЫМ после MIME типов
# Проверяем что файл существует в файловой системе
RewriteCond %{REQUEST_URI} ^/assets/(.*)$ [NC]
RewriteCond %{DOCUMENT_ROOT}/frontend/dist/assets/%1 -f
RewriteRule ^assets/(.*)$ /frontend/dist/assets/$1 [L]

# Если файл не найден в файловой системе, НЕ проксируем к Python
# Просто возвращаем 404 (чтобы не попасть в SPA routing)
RewriteCond %{REQUEST_URI} ^/assets/ [NC]
RewriteRule ^(.*)$ - [R=404,L]

# Статические файлы с расширениями - обслуживаем напрямую (если не /assets/)
RewriteCond %{REQUEST_URI} !^/assets/ [NC]
RewriteCond %{REQUEST_URI} \.(ico|txt|xml|json|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$ [NC]
RewriteCond %{REQUEST_URI} !^/api/ [NC]
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^(.*)$ - [L]

# API requests - proxy to Python backend
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^(.*)$ /wsgi.py/$1 [L]

# Frontend SPA routing - отдаем index.html для всех остальных путей
# ВАЖНО: это должно быть ПОСЛЕДНИМ правилом
# И ВАЖНО: исключаем /assets/ из этого правила!
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

# Disable directory browsing
Options -Indexes

# Set default charset
AddDefaultCharset UTF-8
```

---

## 🔑 Ключевые изменения:

### 1. Правило для `/assets/` ПЕРВОЕ:
```apache
# Проверяем существование файла
RewriteCond %{REQUEST_URI} ^/assets/(.*)$ [NC]
RewriteCond %{DOCUMENT_ROOT}/frontend/dist/assets/%1 -f
RewriteRule ^assets/(.*)$ /frontend/dist/assets/$1 [L]
```

### 2. Если файл не найден - 404, а не проксирование:
```apache
# НЕ проксируем к Python, возвращаем 404
RewriteCond %{REQUEST_URI} ^/assets/ [NC]
RewriteRule ^(.*)$ - [R=404,L]
```

### 3. `/assets/` исключен из SPA routing:
```apache
RewriteCond %{REQUEST_URI} !^/assets/  # Исключаем /assets/
```

---

## 📋 ШАГИ ДЛЯ ИСПРАВЛЕНИЯ:

### Шаг 1: Загрузите исправленный .htaccess

1. **Откройте File Manager** в панели Spaceship
2. **Перейдите в** `/home/kdlqemdxxn/zakup.one/`
3. **Найдите файл** `.htaccess`
4. **Откройте для редактирования**
5. **ЗАМЕНИТЕ ВСЁ содержимое** на исправленную версию выше
6. **Сохраните**

### Шаг 2: Проверьте права доступа

```bash
chmod 644 /home/kdlqemdxxn/zakup.one/.htaccess
```

### Шаг 3: Очистите кеш браузера

- `Ctrl+Shift+R` (Windows/Linux)
- `Cmd+Shift+R` (Mac)

### Шаг 4: Проверьте результат

Откройте в браузере:
```
https://zakup.one/assets/index-CHy6TYul.css
```

**Должно показать CSS код, а не HTML!**

---

## 🧪 Проверка через curl:

На сервере выполните:

```bash
curl -I https://zakup.one/assets/index-CHy6TYul.css
```

**Должно быть:**
```
Content-Type: text/css
```

**Если все еще `Content-Type: text/html`** → `.htaccess` не применился или Apache не обрабатывает правила.

---

## 🆘 Если все еще не работает:

### Вариант 1: Проверьте DOCUMENT_ROOT

Возможно `%{DOCUMENT_ROOT}` указывает не туда. Попробуйте использовать полный путь:

```apache
# Вместо %{DOCUMENT_ROOT}/frontend/dist/assets/%1
# Используйте:
RewriteCond /home/kdlqemdxxn/zakup.one/frontend/dist/assets/%1 -f
```

### Вариант 2: Проверьте что Apache обрабатывает .htaccess

```bash
# Проверьте конфигурацию Apache
grep -i "AllowOverride" /etc/apache2/apache2.conf
# Должно быть: AllowOverride All
```

### Вариант 3: Временно отключите SPA routing

Закомментируйте последнее правило в `.htaccess`:
```apache
# RewriteRule ^(.*)$ /frontend/dist/index.html [L]
```

И проверьте работает ли `/assets/`.

---

## ✅ После исправления:

1. Очистите кеш браузера
2. Обновите страницу
3. Проверьте консоль - ошибки MIME типов должны исчезнуть
4. Frontend должен отображаться правильно

---

**ГЛАВНОЕ: Загрузите исправленный .htaccess на сервер! Это критично! 🚨**

