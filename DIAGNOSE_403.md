# 🔍 Диагностика ошибки 403 Forbidden

## ❌ Проблема сохраняется

Если после исправления прав доступа и `.htaccess` все еще 403, нужно проверить:

---

## 🔍 ДИАГНОСТИКА:

### 1. Проверьте что FastAPI работает

```bash
curl https://zakup.one/health
```

**Ожидаемый результат:**
```json
{"status":"ok","message":"API is running","frontend":"available"}
```

**Если не работает:**
- FastAPI не запущен
- Проблема в `wsgi.py`
- Проблема в настройках Spaceship

### 2. Проверьте прямой доступ к index.html

```bash
curl https://zakup.one/frontend/dist/index.html
```

**Ожидаемый результат:**
- HTML код страницы

**Если 403:**
- Проблема с правами доступа
- Файл не существует

### 3. Проверьте права доступа

```bash
cd /home/kdlqemdxxn/zakup.one
ls -la frontend/dist/index.html
```

**Должно быть:**
```
-rw-r--r-- 1 kdlqemdxxn kdlqemdxxn 583 Nov 14 09:06 frontend/dist/index.html
```

**Если права другие:**
```bash
chmod 644 frontend/dist/index.html
chmod 755 frontend/dist
```

### 4. Проверьте что .htaccess обрабатывается

```bash
# Проверьте что файл существует
ls -la .htaccess

# Проверьте содержимое
head -5 .htaccess
```

### 5. Проверьте логи ошибок

В панели Spaceship найдите логи и проверьте ошибки Apache/LiteSpeed.

---

## 🆘 АЛЬТЕРНАТИВНОЕ РЕШЕНИЕ:

Если `.htaccess` не работает, попробуйте использовать FastAPI для всего routing:

### Вариант 1: Минимальный .htaccess

```apache
RewriteEngine On
Options -Indexes

# Все запросы к Python
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /wsgi.py/$1 [L]
```

И пусть FastAPI обрабатывает все routing (включая `/assets/` и SPA).

### Вариант 2: Проверьте настройки LiteSpeed

В панели LiteSpeed для домена `zakup.one`:
- **Document Root**: `/home/kdlqemdxxn/zakup.one`
- **Index Files**: `index.html`
- **Enable Rewrite**: `Yes`
- **Follow Symbolic Links**: `Yes`

### Вариант 3: Временно отключите .htaccess

Переименуйте `.htaccess` в `.htaccess.bak` и проверьте работает ли FastAPI напрямую:

```bash
mv .htaccess .htaccess.bak
```

Затем проверьте:
```bash
curl https://zakup.one/health
```

---

## 📋 Чеклист диагностики:

- [ ] FastAPI работает (`/health` возвращает JSON)
- [ ] `index.html` доступен напрямую (`/frontend/dist/index.html`)
- [ ] Права доступа правильные (755 для директорий, 644 для файлов)
- [ ] `.htaccess` существует и содержит правила
- [ ] Логи не показывают ошибок

---

## 🎯 Следующий шаг:

**Выполните на сервере:**

```bash
# 1. Проверьте FastAPI
curl https://zakup.one/health

# 2. Проверьте прямой доступ
curl https://zakup.one/frontend/dist/index.html

# 3. Проверьте права
ls -la frontend/dist/index.html

# 4. Проверьте .htaccess
ls -la .htaccess
cat .htaccess | head -10
```

**Пришлите результаты этих команд!**

