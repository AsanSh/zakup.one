# 🚨 СРОЧНОЕ ИСПРАВЛЕНИЕ: API возвращает 404

## ❌ Проблема
- `POST https://zakup.one/api/v1/auth/login 404 (Not Found)`
- Ответ - HTML страница от LiteSpeed, а не JSON от FastAPI
- Это означает, что запросы **НЕ ДОХОДЯТ** до Python приложения

## ✅ РЕШЕНИЕ (3 шага)

### ШАГ 1: Проверить настройки Spaceship (КРИТИЧНО!)

В панели Spaceship для домена `zakup.one`:

1. **Откройте настройки Python приложения**
2. **Проверьте:**
   - **Application root**: `/home/kdlqemdxxn/zakup.one`
   - **Startup file**: `wsgi.py`
   - **Entry point**: `application` (БЕЗ `wsgi:` или `:`)
   - **Python version**: `3.11`
   - **Status**: `Running` (если не запущено - ЗАПУСТИТЕ!)

3. **Если приложение не запущено:**
   - Нажмите **START** или **RESTART**
   - Подождите 10-15 секунд
   - Проверьте что статус изменился на `Running`

### ШАГ 2: Обновить `.htaccess`

**ВАЖНО**: Для Spaceship формат может отличаться. Попробуйте **ОБА варианта**:

#### Вариант A: Текущий (если не работает, переходите к B)

```apache
RewriteCond %{REQUEST_URI} ^/api/ [NC,OR]
RewriteCond %{REQUEST_URI} ^/health$ [NC]
RewriteRule ^(.*)$ wsgi.py/$1 [E=REQUEST_URI:$1,L]
```

#### Вариант B: Для Spaceship (ПОПРОБУЙТЕ ЭТОТ!)

Замените строки 34-36 в `.htaccess` на:

```apache
RewriteCond %{REQUEST_URI} ^/api/ [NC,OR]
RewriteCond %{REQUEST_URI} ^/health$ [NC]
RewriteRule ^(.*)$ wsgi.py [E=REQUEST_URI:$1,L,QSA]
```

**Ключевое отличие**: `wsgi.py` вместо `wsgi.py/$1` - Spaceship может требовать такой формат.

### ШАГ 3: Проверить что работает

```bash
# На сервере проверьте:
curl -v https://zakup.one/api/v1/health

# Должен вернуть JSON:
# {"status":"ok","database":"connected"}
# НЕ HTML страницу!
```

## 🔍 ДИАГНОСТИКА

### Проверка 1: Приложение запущено?

В Spaceship:
- Status должен быть `Running`
- Если `Stopped` - запустите!

### Проверка 2: wsgi.py правильный?

```bash
cd /home/kdlqemdxxn/zakup.one
cat wsgi.py | grep -E "(from app.main import app|application = app)"
```

Должно показать:
```python
from app.main import app
application = app
```

### Проверка 3: Логи приложения

В панели Spaceship найдите логи и проверьте:
- Есть ли ошибки при запуске?
- Импортируется ли `app` правильно?

## 🆘 ЕСЛИ ВСЕ ЕЩЕ 404

### Альтернативное решение: Упрощенный .htaccess

Если ничего не помогает, попробуйте **минимальную версию**:

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

## 📋 ЧЕКЛИСТ

- [ ] **Spaceship**: Application status = `Running`
- [ ] **Spaceship**: Entry point = `application` (БЕЗ `:`)
- [ ] **Spaceship**: Startup file = `wsgi.py`
- [ ] **.htaccess**: Обновлен с правильным форматом
- [ ] **Проверка**: `curl https://zakup.one/api/v1/health` возвращает JSON
- [ ] **Логи**: Нет ошибок в логах приложения

## 🎯 ГЛАВНОЕ

**90% проблем с 404 на Spaceship связаны с тем, что:**
1. Приложение не запущено (Status != Running)
2. Неправильный Entry point (должно быть `application`, не `wsgi:application`)

**Проверьте это ПЕРВЫМ делом!**

