# Исправление проблемы входа в админ-панель

## Проблема
Не удается войти в админ-панель с данными `admin@zakup.one` / `admin123`

## Решение

### Шаг 1: Проверьте наличие админа в базе данных

```bash
# Активируйте виртуальное окружение
source venv/bin/activate  # или python3 -m venv venv && source venv/bin/activate

# Запустите скрипт проверки/создания админа
python3 check_and_create_admin.py
```

Скрипт:
- Проверит подключение к БД
- Проверит наличие админа
- Создаст админа, если его нет
- Исправит флаги, если они установлены неправильно

### Шаг 2: Проверьте данные для входа

**Email:** `admin@zakup.one`  
**Пароль:** `admin123`

### Шаг 3: Проверьте консоль браузера

Откройте DevTools (F12) → Console и проверьте:
- Есть ли ошибки при логине
- Что показывает `console.log` после логина
- Правильно ли определяется `user.is_admin`

### Шаг 4: Проверьте Network запросы

В DevTools → Network проверьте:
- Запрос `/api/v1/auth/login` возвращает статус 200
- В ответе есть `user` с `is_admin: true`
- Токен сохраняется в localStorage

### Шаг 5: Альтернативный способ создания админа

Если скрипт не работает, создайте админа через SQL:

```bash
# Подключитесь к базе данных
psql zakup_db

# Выполните SQL
INSERT INTO users (email, full_name, company, hashed_password, is_admin, is_verified, is_active, created_at)
VALUES (
  'admin@zakup.one',
  'Администратор',
  'ZAKUP.ONE',
  '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',  -- admin123 (bcrypt)
  true,
  true,
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  is_admin = true,
  is_verified = true,
  is_active = true,
  hashed_password = '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';
```

## Отладка

Добавлены `console.log` в:
- `Login.tsx` - для отладки редиректа
- `authStore.ts` - для отладки сохранения данных
- `App.tsx` - для отладки ProtectedRoute

Проверьте консоль браузера после попытки входа.

## Возможные проблемы

1. **Админ не создан в БД**
   - Решение: Запустите `check_and_create_admin.py`

2. **Неправильный пароль**
   - Решение: Используйте `admin123` (без пробелов)

3. **Флаги админа не установлены**
   - Решение: Скрипт автоматически исправит флаги

4. **Проблема с токеном**
   - Решение: Очистите localStorage и войдите снова

5. **Проблема с редиректом**
   - Решение: Проверьте консоль браузера на ошибки

## После исправления

1. Войдите с данными `admin@zakup.one` / `admin123`
2. Должен произойти автоматический редирект на `/admin`
3. Если редирект не происходит, проверьте консоль браузера

