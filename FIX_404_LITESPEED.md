# 🔧 Исправление 404 ошибки на LiteSpeed

## ❌ Проблема:
```
404 Not Found
Proudly powered by LiteSpeed Web Server
```

**Это означает:**
- Запросы не доходят до FastAPI
- LiteSpeed не может найти ресурс
- Возможно неправильный формат проксирования для LiteSpeed

---

## ✅ РЕШЕНИЕ:

### Проблема: LiteSpeed использует другой формат

LiteSpeed может требовать другой формат для проксирования к Python приложениям.

### Вариант 1: Проверьте настройки в панели Spaceship

В панели Spaceship для домена `zakup.one`:

1. **Application settings:**
   - Application root: `/home/kdlqemdxxn/zakup.one`
   - Application startup file: `wsgi.py`
   - Application Entry point: `application`
   - Python version: `3.11`

2. **Убедитесь что приложение запущено:**
   - Status: `Running`
   - Если не запущено - запустите

### Вариант 2: Альтернативный .htaccess для LiteSpeed

Попробуйте упрощенную версию:

```apache
RewriteEngine On
Options -Indexes

# Все запросы к Python (кроме статических файлов)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/assets/
RewriteCond %{REQUEST_URI} !^/frontend/dist/
RewriteRule ^(.*)$ /wsgi.py/$1 [L]
```

### Вариант 3: Проверьте что wsgi.py существует и правильный

```bash
cd /home/kdlqemdxxn/zakup.one
ls -la wsgi.py
cat wsgi.py | head -30
```

Убедитесь что:
- Файл существует
- Содержит `from app.main import app`
- Содержит `application = app`

---

## 🔍 ДИАГНОСТИКА:

### 1. Проверьте что FastAPI приложение настроено в Spaceship

В панели Spaceship:
- Найдите настройки Python приложения
- Убедитесь что указан правильный путь к `wsgi.py`
- Убедитесь что приложение запущено

### 2. Проверьте логи

В панели Spaceship найдите логи приложения и проверьте ошибки.

### 3. Попробуйте прямой доступ к wsgi.py

```bash
# Это не должно работать напрямую, но проверит что файл существует
ls -la /home/kdlqemdxxn/zakup.one/wsgi.py
```

---

## 🆘 Если все еще 404:

### Вариант 1: Используйте Passenger вместо прямого проксирования

Если Spaceship использует Passenger, возможно нужен файл `passenger_wsgi.py`:

```python
import sys
import os

# Добавляем путь к проекту
sys.path.insert(0, os.path.dirname(__file__))

# Импортируем приложение
from wsgi import application
```

### Вариант 2: Проверьте конфигурацию LiteSpeed

В панели LiteSpeed для домена:
- **Script Handler**: должен быть настроен для `.py` файлов
- **Python App**: должен быть создан и запущен

---

## 📋 Чеклист:

- [ ] FastAPI приложение настроено в панели Spaceship
- [ ] Application status: `Running`
- [ ] `wsgi.py` существует и правильный
- [ ] `.htaccess` содержит правила для проксирования
- [ ] Логи не показывают критических ошибок

---

**ГЛАВНОЕ: Проверьте настройки Python приложения в панели Spaceship!**

