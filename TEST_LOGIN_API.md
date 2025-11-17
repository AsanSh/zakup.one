# 🔧 Тестирование API логина

## ❌ Проблема:
Ошибка "Токен не получен от сервера" при попытке входа.

**Это означает:**
- Запрос доходит до API ✅
- Но ответ неправильный или пользователь не найден ❌

---

## ✅ РЕШЕНИЕ:

### ШАГ 1: Проверьте что пользователь создан

На сервере выполните:

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python3 create_superadmin.py
```

### ШАГ 2: Проверьте API логина напрямую

На сервере выполните:

```bash
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6#"
```

**Ожидаемый результат:**
```json
{
  "access_token": "...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "asannameg@gmail.com",
    "full_name": "asannameg",
    ...
  }
}
```

**Если ошибка:**
- Проверьте что пользователь существует
- Проверьте что пароль правильный
- Проверьте что база данных подключена

### ШАГ 3: Проверьте формат запроса

Frontend отправляет запрос в формате `application/x-www-form-urlencoded`:
- `username` = email
- `password` = пароль

API ожидает `OAuth2PasswordRequestForm`, который использует:
- `username` (это email)
- `password`

---

## 🔍 ДИАГНОСТИКА:

### Проверка 1: Пользователь существует?

Если есть доступ к БД:

```sql
SELECT email, full_name, is_admin, is_verified, is_active 
FROM users 
WHERE email = 'asannameg@gmail.com';
```

### Проверка 2: API работает?

```bash
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6#"
```

### Проверка 3: Проверьте логи приложения

В панели Spaceship найдите логи и проверьте ошибки при логине.

---

## 🆘 Если все еще ошибка:

### Вариант 1: Проверьте что база данных подключена

```bash
curl https://zakup.one/api/v1/health
```

Должен вернуть:
```json
{"status":"ok","database":"connected"}
```

Если `"database":"error"` → проблема с подключением к БД.

### Вариант 2: Проверьте переменные окружения

Убедитесь что в панели Spaceship добавлены:
- `DATABASE_URL` (если используется PostgreSQL)
- `SECRET_KEY`

### Вариант 3: Проверьте что пользователь активен

Убедитесь что:
- `is_active = true`
- `is_verified = true` (или `is_admin = true`)
- `is_admin = true`

---

## 📋 Чеклист:

- [ ] Пользователь создан через `create_superadmin.py`
- [ ] API возвращает правильный ответ (проверено через curl)
- [ ] База данных подключена
- [ ] Переменные окружения настроены
- [ ] Пользователь активен и верифицирован

---

**ГЛАВНОЕ: Создайте пользователя через скрипт и проверьте API через curl!**

