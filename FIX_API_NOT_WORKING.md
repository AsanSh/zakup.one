# 🔧 Исправление: API возвращает HTML вместо JSON

## ❌ Проблема:
```bash
curl https://zakup.one/api/v1/health
# Возвращает HTML (index.html) вместо JSON
```

**Это означает:**
- Запросы к `/api/` не доходят до FastAPI
- Все попадает в SPA routing
- `.htaccess` не проксирует правильно к Python

---

## ✅ РЕШЕНИЕ:

### ШАГ 1: Загрузите исправленный .htaccess

**Ключевое изменение:**
- Правило для `/api/` и `/health` теперь использует `[NC,OR]` для объединения условий
- Это гарантирует что эти запросы попадут в Python ДО SPA routing

### ШАГ 2: Проверьте что FastAPI приложение запущено

В панели Spaceship:
- **Application status**: `Running`
- Если не запущено - запустите

### ШАГ 3: Проверьте результат

```bash
curl https://zakup.one/api/v1/health
```

**Ожидаемый результат:**
```json
{"status":"ok","database":"connected"}
```

**Если все еще HTML:**
- Проверьте что `.htaccess` загружен на сервер
- Проверьте что приложение запущено
- Проверьте логи приложения

---

## 🔍 ДИАГНОСТИКА:

### Проверка 1: .htaccess обрабатывается?

```bash
# На сервере
cat /home/kdlqemdxxn/zakup.one/.htaccess | grep -A 3 "api"
```

Должно быть правило для `/api/`.

### Проверка 2: FastAPI работает?

```bash
# Попробуйте прямой доступ (может не работать, но проверит что приложение запущено)
curl https://zakup.one/health
```

### Проверка 3: Логи приложения

В панели Spaceship найдите логи и проверьте ошибки.

---

## 🆘 Если все еще не работает:

### Вариант 1: Проверьте настройки LiteSpeed

В панели LiteSpeed для домена `zakup.one`:
- **Script Handler**: должен быть настроен для `.py` файлов
- **Python App**: должен быть создан и запущен

### Вариант 2: Временно упростите .htaccess

Создайте минимальный `.htaccess`:

```apache
RewriteEngine On
Options -Indexes

# Все запросы к Python
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /wsgi.py/$1 [L]
```

И пусть FastAPI обрабатывает все routing.

---

## 📋 Исправленный .htaccess:

Правило для `/api/` и `/health` должно быть ПЕРВЫМ:

```apache
# КРИТИЧЕСКИ ВАЖНО: API и Health endpoints ПЕРВЫМИ
RewriteCond %{REQUEST_URI} ^/api/ [NC,OR]
RewriteCond %{REQUEST_URI} ^/health$ [NC]
RewriteRule ^(.*)$ /wsgi.py/$1 [L]
```

**ВАЖНО:** Эти правила должны быть ДО правила для SPA routing!

---

## ✅ После исправления:

1. Загрузите исправленный `.htaccess`
2. Проверьте: `curl https://zakup.one/api/v1/health`
3. Должен вернуть JSON, а не HTML
4. Frontend должен работать правильно

---

**ГЛАВНОЕ: Загрузите исправленный .htaccess с правильным правилом для /api/!**

