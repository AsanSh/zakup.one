# 🔧 Исправление: /health возвращает HTML вместо JSON

## ❌ Проблема:
```bash
curl https://zakup.one/health
# Возвращает HTML (index.html) вместо JSON
```

**Это означает:**
- Запросы к `/health` не доходят до FastAPI
- Все попадает в SPA routing
- `.htaccess` не проксирует правильно

---

## ✅ РЕШЕНИЕ:

### ШАГ 1: Загрузите исправленный .htaccess

**Ключевое изменение:**
- Правило для `/health` и `/api/` теперь **ПЕРВОЕ** (до SPA routing)
- Это гарантирует что эти запросы попадут в FastAPI

### ШАГ 2: Проверьте что FastAPI запущен

В панели Spaceship проверьте:
- **Application status**: `Running`
- **Application startup file**: `wsgi.py`
- **Application Entry point**: `application`

### ШАГ 3: Проверьте результат

```bash
# Должно вернуть JSON, а не HTML
curl https://zakup.one/health

# Ожидаемый результат:
# {"status":"ok","message":"API is running","frontend":"available"}
```

---

## 🔍 Если все еще не работает:

### Вариант 1: Проверьте wsgi.py

```bash
cd /home/kdlqemdxxn/zakup.one
cat wsgi.py | head -20
```

Убедитесь что:
- `from app.main import app`
- `application = app`

### Вариант 2: Проверьте логи

В панели Spaceship найдите логи приложения и проверьте ошибки.

### Вариант 3: Перезапустите приложение

В панели Spaceship:
- Остановите приложение
- Запустите снова

---

## 📋 Исправленный .htaccess:

Правило для `/health` и `/api/` должно быть **ПЕРВЫМ**:

```apache
# Health check endpoints - проксируем к FastAPI
RewriteCond %{REQUEST_URI} ^/health$ [NC]
RewriteRule ^(.*)$ /wsgi.py/$1 [L]

RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^(.*)$ /wsgi.py/$1 [L]
```

**ВАЖНО:** Эти правила должны быть ДО правила для SPA routing!

---

## ✅ После исправления:

1. Загрузите исправленный `.htaccess`
2. Проверьте: `curl https://zakup.one/health`
3. Должно вернуть JSON, а не HTML
4. Frontend должен работать правильно

