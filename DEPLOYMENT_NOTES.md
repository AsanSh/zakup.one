# 📋 ЗАМЕТКИ ПО ДЕПЛОЮ

## Расположение файлов на сервере

### Структура проекта:
```
/home/kdlqemdxxn/zakup.one/
├── .htaccess          # ← ВАЖНО: должен быть в корне
├── wsgi.py            # ← Entry point для Spaceship
├── app/               # Backend код
│   ├── main.py
│   └── ...
├── frontend/
│   └── dist/          # Собранный frontend
│       ├── index.html
│       └── assets/
└── .env               # Переменные окружения
```

## Настройки Spaceship

### Python Application Settings:

1. **Application root**: `/home/kdlqemdxxn/zakup.one`
   - Полный путь к корню проекта

2. **Startup file**: `wsgi.py`
   - Файл, который запускает приложение

3. **Entry point**: `application`
   - ⚠️ **КРИТИЧНО**: Должно быть `application`, НЕ `wsgi:application` или `wsgi.application`
   - Это переменная из `wsgi.py`: `application = app`

4. **Python version**: `3.11`
   - Версия Python для виртуального окружения

5. **Status**: `Running`
   - Приложение должно быть запущено

## Проверка работы API

### 1. Health endpoint

```bash
curl https://zakup.one/api/v1/health
```

**Ожидаемый ответ:**
```json
{"status":"ok","database":"connected"}
```

**Если HTML 404:**
- Запросы не доходят до FastAPI
- Проверьте `.htaccess` и настройки Spaceship

### 2. Login endpoint

```bash
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6#"
```

**Ожидаемый ответ:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {...}
}
```

**Если HTML 404:**
- Проблема с проксированием `/api/*` в `.htaccess`

## .htaccess - ключевые правила

### Правило для API (должно быть ПЕРВЫМ):

```apache
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^(.*)$ wsgi.py [E=REQUEST_URI:$1,L,QSA]
```

**Важно:**
- `wsgi.py` без ведущего слеша `/`
- `[E=REQUEST_URI:$1,L,QSA]` - передает оригинальный путь
- Это правило должно быть ДО правил для статики

### Правило для SPA (должно быть ПОСЛЕДНИМ):

```apache
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/assets/
RewriteRule ^(.*)$ /frontend/dist/index.html [L]
```

## Типичные проблемы

### Проблема 1: 404 HTML вместо JSON

**Симптомы:**
- `curl https://zakup.one/api/v1/health` возвращает HTML
- В браузере видно "404 Not Found" от LiteSpeed

**Причины:**
1. Приложение не запущено в Spaceship
2. Неправильный Entry point (должно быть `application`)
3. `.htaccess` не проксирует `/api/*` к `wsgi.py`

**Решение:**
1. Проверьте Status в Spaceship = `Running`
2. Проверьте Entry point = `application`
3. Обновите `.htaccess` (см. текущий файл в репозитории)
4. Перезапустите приложение

### Проблема 2: Frontend не открывается

**Симптомы:**
- Открывается список директорий или 403/404

**Решение:**
1. Убедитесь что `frontend/dist/index.html` существует
2. Проверьте права доступа: `chmod 644 frontend/dist/index.html`
3. Проверьте что `.htaccess` содержит правило для SPA routing

### Проблема 3: Статические файлы не загружаются

**Симптомы:**
- CSS/JS файлы возвращают 404 или HTML

**Решение:**
1. Проверьте что `/assets/*` обслуживается напрямую
2. Проверьте MIME types в `.htaccess`
3. Убедитесь что файлы существуют в `frontend/dist/assets/`

## Создание пользователя

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python create_superadmin.py
```

Или используйте inline команду из `CREATE_USER_COMMAND.md`

## Тестирование

### Автоматический тест:

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip install requests
python test_login.py
```

### Ручная проверка:

```bash
# Health check
curl https://zakup.one/api/v1/health

# Login
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6#"
```

## Логи

### Где искать логи:

1. **Spaceship панель**: Логи приложения
2. **Логи LiteSpeed**: `/var/log/lsws/error.log` (если доступно)
3. **Логи приложения**: В панели Spaceship найдите раздел "Logs"

### Что проверять:

- Ошибки при импорте `app` в `wsgi.py`
- Ошибки подключения к базе данных
- Ошибки в роутерах API

## Чеклист деплоя

- [ ] Все файлы загружены на сервер
- [ ] `.htaccess` в корне проекта
- [ ] `wsgi.py` в корне проекта
- [ ] `frontend/dist/` содержит собранный frontend
- [ ] `.env` создан с правильными переменными
- [ ] Зависимости установлены (`pip install -r requirements.txt`)
- [ ] Приложение запущено в Spaceship (Status = Running)
- [ ] Entry point = `application`
- [ ] Health endpoint работает: `curl https://zakup.one/api/v1/health`
- [ ] Login endpoint работает: `python test_login.py`
- [ ] Frontend открывается в браузере
- [ ] Пользователь создан в базе

## Полезные команды

```bash
# Проверка структуры
ls -la /home/kdlqemdxxn/zakup.one/

# Проверка wsgi.py
cat /home/kdlqemdxxn/zakup.one/wsgi.py | head -20

# Проверка .htaccess
cat /home/kdlqemdxxn/zakup.one/.htaccess

# Проверка frontend
ls -la /home/kdlqemdxxn/zakup.one/frontend/dist/

# Проверка прав доступа
chmod 644 /home/kdlqemdxxn/zakup.one/.htaccess
chmod 755 /home/kdlqemdxxn/zakup.one/wsgi.py
```

## Контакты и поддержка

При проблемах:
1. Проверьте `URGENT_FIX_404_API.md`
2. Запустите `test_login.py` для диагностики
3. Проверьте логи в Spaceship
4. Убедитесь что все настройки соответствуют этой документации

