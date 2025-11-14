# 🔧 Исправление 404 для API на LiteSpeed

## ❌ Проблема:
```bash
curl https://zakup.one/api/v1/health
# Возвращает 404 от LiteSpeed
```

**Это означает:**
- `.htaccess` пытается проксировать к `/wsgi.py/`, но LiteSpeed не может найти ресурс
- Возможно приложение не запущено или неправильно настроено
- LiteSpeed может требовать другой формат для проксирования

---

## ✅ РЕШЕНИЕ:

### ШАГ 1: Проверьте настройки приложения в Spaceship

В панели Spaceship проверьте:

1. **Application status**: Должно быть `Running`
   - Если не запущено - запустите

2. **Application root**: `/home/kdlqemdxxn/zakup.one`
   - Должен быть полный путь

3. **Application startup file**: `wsgi.py`
   - Должен быть правильный файл

4. **Application Entry point**: `application`
   - Должно быть без `wsgi:`

5. **Python version**: `3.11.13`
   - Должна быть правильная версия

### ШАГ 2: Перезапустите приложение

В панели Spaceship:
1. Нажмите **STOP APP** (если запущено)
2. Подождите несколько секунд
3. Нажмите **START APP** или **RESTART**

### ШАГ 3: Проверьте логи

В панели Spaceship найдите логи приложения и проверьте:
- Есть ли ошибки при запуске
- Импортируется ли `app` правильно
- Есть ли ошибки в `wsgi.py`

### ШАГ 4: Проверьте wsgi.py

На сервере выполните:

```bash
cd /home/kdlqemdxxn/zakup.one
cat wsgi.py | head -30
```

Убедитесь что:
- `from app.main import app` есть
- `application = app` есть
- Нет синтаксических ошибок

### ШАГ 5: Проверьте что приложение импортируется

На сервере выполните:

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python3 -c "from app.main import app; print('✅ App imported successfully')"
```

**Если ошибка:**
- Проверьте что зависимости установлены
- Проверьте что `.env` файл существует
- Проверьте логи ошибок

---

## 🆘 Если все еще 404:

### Вариант 1: Упростите .htaccess

Создайте минимальный `.htaccess`:

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

### Вариант 2: Проверьте настройки LiteSpeed

В панели LiteSpeed для домена `zakup.one`:
- **Script Handler**: должен быть настроен для `.py` файлов
- **Python App**: должен быть создан и запущен
- **Application URI**: должен быть `/` или пусто

### Вариант 3: Временно отключите .htaccess

Переименуйте `.htaccess` и проверьте работает ли приложение напрямую:

```bash
mv .htaccess .htaccess.bak
```

Затем проверьте:
```bash
curl https://zakup.one/health
```

Если работает - проблема в `.htaccess`.  
Если не работает - проблема в настройках приложения.

---

## 📋 Чеклист:

- [ ] Приложение запущено в панели Spaceship
- [ ] Application root правильный (`/home/kdlqemdxxn/zakup.one`)
- [ ] Application startup file правильный (`wsgi.py`)
- [ ] Application Entry point правильный (`application`)
- [ ] `wsgi.py` существует и правильный
- [ ] Приложение импортируется без ошибок
- [ ] Логи не показывают критических ошибок

---

## 🔍 Диагностика:

### Проверка 1: Приложение запущено?

В панели Spaceship должна быть кнопка "STOP APP" (значит запущено).

### Проверка 2: wsgi.py правильный?

```bash
grep "from app.main import app" /home/kdlqemdxxn/zakup.one/wsgi.py
grep "application = app" /home/kdlqemdxxn/zakup.one/wsgi.py
```

### Проверка 3: Приложение импортируется?

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python3 -c "from app.main import app; print('OK')"
```

---

**ГЛАВНОЕ: Проверьте что приложение запущено в панели Spaceship и wsgi.py правильный!**

