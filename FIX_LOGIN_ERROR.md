# 🔧 Исправление ошибки "Токен не получен от сервера"

## ❌ Проблема:
При попытке входа с `admin@zakup.one` / `admin` появляется ошибка:
```
Токен не получен от сервера
```

**Это означает:**
- Frontend работает ✅
- API не отвечает или пользователь не существует ❌

---

## ✅ РЕШЕНИЕ:

### ШАГ 1: Проверьте что API работает

На сервере выполните:

```bash
curl https://zakup.one/api/v1/health
```

**Ожидаемый результат:**
```json
{"status":"ok","database":"connected"}
```

**Если не работает:**
- Проверьте что FastAPI приложение запущено в панели Spaceship
- Проверьте логи приложения

### ШАГ 2: Проверьте базу данных

```bash
curl https://zakup.one/health
```

Должен вернуть JSON, а не HTML.

### ШАГ 3: Создайте администратора

**Вариант 1: Через скрипт (РЕКОМЕНДУЕТСЯ)**

На сервере выполните:

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python3 create_admin.py
```

**Вариант 2: Через SQL (если есть доступ к БД)**

```sql
-- Сначала нужно получить хеш пароля "admin"
-- Выполните в Python:
-- python3 -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto'); print(pwd_context.hash('admin'))"

INSERT INTO users (email, full_name, company, hashed_password, is_admin, is_verified, is_active)
VALUES (
  'admin@zakup.one',
  'Администратор',
  'ZAKUP.ONE',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5',  -- пароль: admin
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

### ШАГ 4: Проверьте вход

1. Откройте `https://zakup.one`
2. Введите:
   - Email: `admin@zakup.one`
   - Пароль: `admin`
3. Нажмите "Войти"

---

## 🔍 ДИАГНОСТИКА:

### Проверка 1: API endpoint работает?

```bash
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@zakup.one&password=admin"
```

**Ожидаемый результат:**
```json
{
  "access_token": "...",
  "token_type": "bearer",
  "user": {...}
}
```

**Если ошибка:**
- Проверьте что пользователь существует в БД
- Проверьте что база данных подключена

### Проверка 2: Пользователь существует?

Если есть доступ к БД:

```sql
SELECT email, full_name, is_admin, is_verified, is_active 
FROM users 
WHERE email = 'admin@zakup.one';
```

---

## 📋 Чеклист:

- [ ] API работает (`/api/v1/health` возвращает JSON)
- [ ] База данных подключена
- [ ] Пользователь `admin@zakup.one` существует
- [ ] Пароль правильный (хеш для "admin")
- [ ] `is_admin = true`
- [ ] `is_verified = true`
- [ ] `is_active = true`

---

**ГЛАВНОЕ: Создайте администратора через скрипт `create_admin.py`!**

