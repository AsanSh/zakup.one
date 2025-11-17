# 🔐 СОЗДАНИЕ СУПЕРАДМИНА НА СЕРВЕРЕ

## 📋 Данные для входа:
- **Email:** `asannameg@gmail.com`
- **Пароль:** `ParolJok6#`

## 🚀 Как создать на сервере:

### Вариант 1: Через скрипт (рекомендуется)

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python3 create_superadmin_asannameg.py
```

### Вариант 2: Через Django shell (если используется Django)

```bash
cd /home/kdlqemdxxn/zakup.one/django_project
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python3 manage.py shell
```

В shell:
```python
from apps.users.models import User
user = User.objects.filter(email='asannameg@gmail.com').first()
if user:
    user.set_password('ParolJok6#')
    user.is_admin = True
    user.is_verified = True
    user.is_active = True
    user.save()
    print("User updated")
else:
    user = User.objects.create_user(
        email='asannameg@gmail.com',
        password='ParolJok6#',
        full_name='asannameg',
        company='ZAKUP.ONE',
        is_admin=True,
        is_verified=True,
        is_active=True
    )
    print(f"User created: {user.email}")
```

### Вариант 3: Через FastAPI (если используется FastAPI)

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python3 create_superadmin_asannameg.py
```

## ✅ Проверка создания:

После создания проверьте через curl:

```bash
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"asannameg@gmail.com","password":"ParolJok6#"}'
```

Должен вернуть JSON с `access_token` и `user`.

## 🔍 Если ошибка 500:

1. **Проверьте логи сервера** - там будет точная ошибка
2. **Проверьте что база данных доступна:**
   ```bash
   python3 -c "from app.core.database import SessionLocal; db = SessionLocal(); db.execute('SELECT 1'); print('DB OK')"
   ```
3. **Проверьте что миграции применены:**
   ```bash
   alembic upgrade head
   ```
4. **Проверьте что зависимости установлены:**
   ```bash
   pip list | grep -i fastapi
   ```

## 📝 Важно:

- Скрипт автоматически обновит пользователя если он уже существует
- Пароль будет захеширован правильно
- Все флаги (is_admin, is_verified, is_active) будут установлены в True

