# 🧪 ТЕСТИРОВАНИЕ API ЛОГИНА

## Описание

Скрипт `test_login.py` проверяет, что:
1. Запросы к `/api/v1/auth/login` доходят до FastAPI (не перехватываются веб-сервером)
2. API возвращает правильный JSON ответ (не HTML 404)
3. Логин работает корректно и возвращает токен

## Запуск на сервере

### Вариант 1: Через SSH

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate

# Установите requests если нет
pip install requests

# Запустите тест
python test_login.py
```

### Вариант 2: Через "Execute python script" в Spaceship

1. Откройте панель Spaceship
2. Перейдите в "Execute python script"
3. Скопируйте содержимое `test_login.py`
4. Вставьте и выполните

### Вариант 3: С кастомным URL

```bash
TEST_API_URL=http://localhost:8000 python test_login.py
```

## Успешный результат

```
✅ УСПЕХ: Логин работает!
   Токен получен: eyJhbGciOiJIUzI1NiIs...
   Пользователь: asannameg@gmail.com
```

**HTTP Status**: `200`  
**Content-Type**: `application/json`  
**Ответ**: JSON с `access_token` и `user`

## Ошибки и решения

### ❌ HTML 404 вместо JSON

**Симптомы:**
```
❌ ОШИБКА: Получен HTML вместо JSON!
   Это означает, что запрос НЕ доходит до FastAPI
```

**Причины:**
1. `.htaccess` не проксирует `/api/*` к `wsgi.py`
2. Приложение не запущено в Spaceship
3. Неправильный Entry point в настройках Spaceship

**Решение:**
1. Проверьте настройки Spaceship:
   - Application root: `/home/kdlqemdxxn/zakup.one`
   - Startup file: `wsgi.py`
   - Entry point: `application` (БЕЗ `:`)
   - Status: `Running`
2. Обновите `.htaccess` (см. `URGENT_FIX_404_API.md`)
3. Перезапустите приложение в Spaceship

### ❌ 401 Unauthorized

**Симптомы:**
```
❌ ОШИБКА: Статус 401
   Сообщение: Неверный email или пароль
```

**Причины:**
- Пользователь не существует в базе
- Неверный пароль
- Пользователь не активен

**Решение:**
1. Создайте пользователя:
   ```bash
   python create_superadmin.py
   ```
2. Проверьте что пользователь активен и верифицирован

### ❌ 403 Forbidden

**Симптомы:**
```
❌ ОШИБКА: Статус 403
   Сообщение: Аккаунт не верифицирован
```

**Решение:**
- Убедитесь что пользователь имеет `is_verified=True` и `is_active=True`
- Для админов можно установить `is_verified=True` автоматически

### ❌ Connection Error / Timeout

**Симптомы:**
```
❌ ОШИБКА: Не удалось подключиться к серверу
```

**Решение:**
- Проверьте доступность сервера: `curl https://zakup.one`
- Проверьте что приложение запущено в Spaceship
- Проверьте логи приложения на наличие ошибок

## Проверка через curl

Альтернативный способ проверки:

```bash
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6#" \
  -v
```

**Успешный ответ:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "asannameg@gmail.com",
    "full_name": "asannameg",
    "is_admin": true
  }
}
```

**Ошибка (HTML 404):**
```html
<!DOCTYPE html>
<html>...
404 Not Found
...
```

## Чеклист

- [ ] Скрипт `test_login.py` запущен
- [ ] Получен JSON ответ (не HTML)
- [ ] HTTP Status = 200
- [ ] Токен присутствует в ответе
- [ ] Пользователь присутствует в ответе

## Следующие шаги

Если тест не проходит:
1. Следуйте инструкциям в `URGENT_FIX_404_API.md`
2. Проверьте настройки Spaceship
3. Проверьте логи приложения
4. Убедитесь что пользователь создан в базе
