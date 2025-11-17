# 🔧 Полное исправление проблемы входа

## ❌ Проблема:
Не могу зайти в систему с `asannameg@gmail.com` / `ParolJok6#`

---

## ✅ ПОШАГОВОЕ РЕШЕНИЕ:

### ШАГ 1: Проверьте что API работает

На сервере выполните:

```bash
curl https://zakup.one/api/v1/health
```

**Ожидаемый результат:**
```json
{"status":"ok","database":"connected"}
```

**Если возвращает HTML или 404:**
- API не работает
- Проверьте что приложение запущено в панели Spaceship
- Перезапустите приложение

### ШАГ 2: Создайте пользователя

На сервере выполните:

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python3 create_superadmin.py
```

**Ожидаемый результат:**
```
✅ Суперадминистратор создан успешно!
   Email: asannameg@gmail.com
   Пароль: ParolJok6#
```

### ШАГ 3: Проверьте API логина

На сервере выполните:

```bash
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6#"
```

**Ожидаемый результат:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "asannameg@gmail.com",
    "full_name": "asannameg",
    "is_admin": true,
    ...
  }
}
```

**Если ошибка 401 "Неверный email или пароль":**
- Пользователь не существует или пароль неправильный
- Проверьте что скрипт выполнился успешно

**Если ошибка 500 или другая:**
- Проблема с базой данных
- Проверьте логи приложения

### ШАГ 4: Проверьте базу данных

```bash
curl https://zakup.one/api/v1/health
```

Должен вернуть:
```json
{"status":"ok","database":"connected"}
```

Если `"database":"error"`:
- Проверьте переменную окружения `DATABASE_URL` в панели Spaceship
- Проверьте что база данных доступна

---

## 🔍 ДИАГНОСТИКА:

### Проверка 1: Пользователь существует?

Если есть доступ к БД, выполните SQL:

```sql
SELECT email, full_name, is_admin, is_verified, is_active, 
       LENGTH(hashed_password) as pwd_length
FROM users 
WHERE email = 'asannameg@gmail.com';
```

Должно вернуть строку с:
- `is_admin = true`
- `is_verified = true`
- `is_active = true`

### Проверка 2: API работает?

```bash
# Проверка health
curl https://zakup.one/api/v1/health

# Проверка логина
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6#"
```

### Проверка 3: Логи приложения

В панели Spaceship найдите логи и проверьте:
- Есть ли ошибки при логине
- Есть ли ошибки подключения к БД
- Есть ли ошибки импорта модулей

---

## 🆘 ЕСЛИ ВСЕ ЕЩЕ НЕ РАБОТАЕТ:

### Вариант 1: Проверьте формат пароля

Символ `#` в пароле может требовать экранирования в curl:

```bash
# Попробуйте с экранированием
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6%23"
```

### Вариант 2: Создайте пользователя через SQL напрямую

Если скрипт не работает, создайте через SQL:

```sql
-- Сначала получите хеш пароля через Python:
-- python3 -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto'); print(pwd_context.hash('ParolJok6#'))"

INSERT INTO users (email, full_name, company, hashed_password, is_admin, is_verified, is_active)
VALUES (
  'asannameg@gmail.com',
  'asannameg',
  'ZAKUP.ONE',
  '$2b$12$...',  -- хеш пароля ParolJok6#
  true,
  true,
  true
)
ON CONFLICT (email) DO UPDATE SET
  hashed_password = EXCLUDED.hashed_password,
  is_admin = true,
  is_verified = true,
  is_active = true;
```

### Вариант 3: Проверьте переменные окружения

В панели Spaceship проверьте что добавлены:
- `SECRET_KEY` (обязательно!)
- `DATABASE_URL` (если используется PostgreSQL)
- `DEBUG` = `False`

---

## 📋 ЧЕКЛИСТ:

- [ ] API работает (`/api/v1/health` возвращает JSON)
- [ ] База данных подключена (`database: connected`)
- [ ] Пользователь создан через `create_superadmin.py`
- [ ] API логина возвращает токен (проверено через curl)
- [ ] Переменные окружения настроены
- [ ] Приложение запущено в панели Spaceship

---

## 🎯 БЫСТРАЯ ПРОВЕРКА:

Выполните все команды по порядку:

```bash
# 1. Проверка API
curl https://zakup.one/api/v1/health

# 2. Создание пользователя
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python3 create_superadmin.py

# 3. Проверка логина
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6#"
```

**Если все три команды работают - вход должен работать!**

---

**ГЛАВНОЕ: Выполните все шаги по порядку и проверьте результаты!**

