# 🚀 БЫСТРОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМЫ С ЛОГИНОМ

## ❌ Проблема
- "Токен не получен от сервера"
- API возвращает 404 ошибку
- Не могу зайти в систему

## ✅ Решение (5 минут)

### Шаг 1: Обновить `.htaccess` на сервере

**ВАЖНО**: Загрузите обновленный `.htaccess` на сервер.

Файл уже исправлен в репозитории. Ключевое изменение:
```apache
# БЫЛО (неправильно):
RewriteRule ^(.*)$ /wsgi.py/$1 [L]

# СТАЛО (правильно):
RewriteRule ^(.*)$ wsgi.py/$1 [E=REQUEST_URI:$1,L]
```

**Действие**: Скопируйте `.htaccess` из репозитория на сервер через FTP/File Manager.

### Шаг 2: Создать пользователя в базе

Выполните на сервере через SSH или "Execute python script":

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python create_superadmin.py
```

Или используйте готовый скрипт `create_superadmin.py`:
- Email: `asannameg@gmail.com`
- Пароль: `ParolJok6#`

### Шаг 3: Проверить API

```bash
# Проверка health
curl https://zakup.one/api/v1/health

# Должен вернуть: {"status":"ok","database":"connected"}

# Проверка login
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6#"

# Должен вернуть JSON с access_token и user
```

### Шаг 4: Перезапустить приложение

В панели Spaceship:
1. Откройте ваше Python приложение
2. Нажмите "Restart" или "Stop" → "Start"

### Шаг 5: Обновить frontend на сервере

Загрузите обновленную папку `frontend/dist/` на сервер:
- Путь: `/home/kdlqemdxxn/zakup.one/frontend/dist/`
- Замените все файлы

## 🧪 Диагностика (если не работает)

### Проверка 1: API роутеры

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python test_api.py
```

Должен показать:
- ✅ App imported successfully
- ✅ /api/v1/health route exists
- ✅ /api/v1/auth/login route exists

### Проверка 2: Настройки Spaceship

В панели Spaceship проверьте:
- **Application root**: `/home/kdlqemdxxn/zakup.one`
- **Startup file**: `wsgi.py`
- **Entry point**: `application` (БЕЗ двоеточия!)
- **Status**: `Running`

### Проверка 3: Логи

```bash
# Проверьте логи приложения
tail -f /var/log/lsws/error.log
```

## 📋 Чеклист

- [ ] `.htaccess` обновлен на сервере
- [ ] Пользователь создан в базе (`create_superadmin.py`)
- [ ] API отвечает (`curl https://zakup.one/api/v1/health`)
- [ ] Приложение перезапущено в Spaceship
- [ ] Frontend обновлен на сервере
- [ ] Проверен вход через браузер

## 🆘 Если все еще не работает

1. **Проверьте что Python приложение запущено**:
   - В Spaceship должно быть "Running"
   - Если нет - перезапустите

2. **Проверьте права доступа**:
   ```bash
   chmod 644 /home/kdlqemdxxn/zakup.one/.htaccess
   chmod 755 /home/kdlqemdxxn/zakup.one/wsgi.py
   ```

3. **Проверьте подключение к БД**:
   ```bash
   python -c "from app.core.database import SessionLocal; db = SessionLocal(); print('OK')"
   ```

4. **Проверьте что все файлы на месте**:
   ```bash
   ls -la /home/kdlqemdxxn/zakup.one/wsgi.py
   ls -la /home/kdlqemdxxn/zakup.one/app/main.py
   ls -la /home/kdlqemdxxn/zakup.one/.env
   ```

## 📝 Примечания

- **LiteSpeed требует специального формата** для проксирования к Python
- **Убедитесь что Entry point**: `application` (не `wsgi:application`)
- **Все запросы к `/api/*`** должны проксироваться к `wsgi.py`
- **Frontend должен быть собран** и загружен в `frontend/dist/`

---

**После выполнения всех шагов проблема должна быть решена!** 🎉

