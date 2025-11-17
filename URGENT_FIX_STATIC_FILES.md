# 🚨 СРОЧНОЕ ИСПРАВЛЕНИЕ: Статические файлы не загружаются

## ❌ Проблема:
Статические файлы (CSS, JS) возвращаются с MIME типом `text/html` вместо правильных типов.

## ✅ РЕШЕНИЕ:

### ШАГ 1: Загрузите исправленный .htaccess

**КРИТИЧЕСКИ ВАЖНО:** Загрузите обновленный `.htaccess` файл на сервер!

1. **Откройте File Manager** в панели Spaceship
2. **Перейдите в** `/home/kdlqemdxxn/zakup.one/`
3. **Найдите файл** `.htaccess`
4. **ЗАМЕНИТЕ** его содержимое на новую версию (см. ниже)

### ШАГ 2: Проверьте структуру файлов

Убедитесь что файлы находятся в правильном месте:
```
/home/kdlqemdxxn/zakup.one/frontend/dist/assets/
├── index-CHy6TYul.css
├── index-CPKm4tFN.js
├── vendor-CT2VWNm-.js
└── ... (другие файлы)
```

### ШАГ 3: Проверьте права доступа

```bash
chmod 644 /home/kdlqemdxxn/zakup.one/.htaccess
chmod -R 755 /home/kdlqemdxxn/zakup.one/frontend/dist
```

---

## 📝 ИСПРАВЛЕННЫЙ .htaccess:

**ВАЖНО:** Скопируйте ВЕСЬ файл ниже и замените содержимое `.htaccess` на сервере!

```apache
# Spaceship .htaccess configuration for zakup.one

# Enable rewrite engine
RewriteEngine On

# Allow direct access to install.php
RewriteCond %{REQUEST_URI} ^/install\.php$ [NC]
RewriteRule ^(.*)$ - [L]

# MIME types for static files - ВАЖНО: должно быть ПЕРВЫМ
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

# Статические файлы из frontend/dist/assets - обслуживаем напрямую Apache
# Это должно быть ДО всех других правил
RewriteCond %{REQUEST_URI} ^/assets/ [NC]
RewriteCond %{DOCUMENT_ROOT}/frontend/dist%{REQUEST_URI} -f
RewriteRule ^assets/(.*)$ /frontend/dist/assets/$1 [L]

# Если файл не найден в файловой системе, проксируем к Python
RewriteCond %{REQUEST_URI} ^/assets/ [NC]
RewriteRule ^(.*)$ /wsgi.py/$1 [L]

# Статические файлы с расширениями - обслуживаем напрямую
RewriteCond %{REQUEST_URI} \.(ico|txt|xml|json|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$ [NC]
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^(.*)$ - [L]

# API requests - proxy to Python backend
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^(.*)$ /wsgi.py/$1 [L]

# Frontend SPA routing - отдаем index.html для всех остальных путей
# ВАЖНО: это должно быть ПОСЛЕДНИМ правилом
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/assets/
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

## 🔍 Ключевые изменения:

1. **MIME типы в начале файла** - до всех правил перезаписи
2. **Правило для `/assets/` ПЕРВЫМ** - до других правил
3. **Проверка существования файла** - `%{DOCUMENT_ROOT}/frontend/dist%{REQUEST_URI} -f`
4. **Прямая отдача файлов** - без проксирования к Python
5. **Исключение `/assets/` из SPA routing** - `RewriteCond %{REQUEST_URI} !^/assets/`

---

## ✅ После загрузки .htaccess:

1. **Очистите кеш браузера:**
   - `Ctrl+Shift+R` (Windows/Linux)
   - `Cmd+Shift+R` (Mac)

2. **Откройте консоль разработчика** (`F12`)

3. **Обновите страницу** - ошибки должны исчезнуть

4. **Проверьте Network tab:**
   - Файлы из `/assets/` должны иметь правильные MIME типы
   - CSS: `text/css`
   - JS: `application/javascript`

---

## 🆘 Если все еще не работает:

### Вариант 1: Проверьте DOCUMENT_ROOT

Возможно `DOCUMENT_ROOT` указывает не туда. Попробуйте изменить правило:

```apache
# Вместо %{DOCUMENT_ROOT}/frontend/dist
# Используйте полный путь:
RewriteCond %{REQUEST_URI} ^/assets/ [NC]
RewriteCond /home/kdlqemdxxn/zakup.one/frontend/dist%{REQUEST_URI} -f
RewriteRule ^assets/(.*)$ /frontend/dist/assets/$1 [L]
```

### Вариант 2: Упрощенное правило

Если не работает проверка файла, используйте упрощенное правило:

```apache
# Просто проксируем все /assets/ к Python
RewriteCond %{REQUEST_URI} ^/assets/ [NC]
RewriteRule ^(.*)$ /wsgi.py/$1 [L]
```

Но тогда нужно убедиться что FastAPI правильно обслуживает статику.

### Вариант 3: Проверьте логи Apache

В панели Spaceship найдите логи Apache и проверьте ошибки.

---

## 📋 Чеклист:

- [ ] Загружен исправленный `.htaccess`
- [ ] Проверена структура файлов `/frontend/dist/assets/`
- [ ] Проверены права доступа
- [ ] Очищен кеш браузера
- [ ] Проверена консоль - нет ошибок MIME типов
- [ ] Frontend отображается правильно

---

**ГЛАВНОЕ: Загрузите исправленный .htaccess на сервер! Это критично! 🚨**

