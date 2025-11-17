# 🔧 ПОЛНОЕ ИСПРАВЛЕНИЕ DJANGO - ВСЕ ПРОБЛЕМЫ

## ✅ Что исправлено:

1. **Улучшен LoginView** - правильная обработка form-data и JSON
2. **Добавлен login_simple** - упрощенный логин для отладки (`/api/v1/auth/login-simple`)
3. **Исправлен CustomTokenObtainPairSerializer** - правильная обработка email/username
4. **Добавлена обработка ошибок** - всегда возвращает JSON

## 🚀 ШАГИ НА СЕРВЕРЕ:

### ШАГ 1: Установить зависимости

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip install Django djangorestframework djangorestframework-simplejwt django-cors-headers python-dotenv psycopg2-binary
```

Или:
```bash
pip install -r requirements_django.txt
```

### ШАГ 2: Применить миграции

```bash
cd /home/kdlqemdxxn/zakup.one/django_project
python manage.py makemigrations
python manage.py migrate
```

### ШАГ 3: Создать пользователя

```bash
python manage.py shell
```

В shell:
```python
from apps.users.models import User
# Проверяем существует ли
user = User.objects.filter(email='asannameg@gmail.com').first()
if user:
    print(f"User exists: {user.email}")
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

### ШАГ 4: Обновить код на сервере

Скопируйте обновленные файлы:
- `django_project/apps/users/views.py`
- `django_project/apps/users/serializers.py`
- `django_project/apps/users/urls.py`
- `django_project/zakup_one/settings.py`

### ШАГ 5: Включить DEBUG

В `.env`:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
```

### ШАГ 6: Перезапустить приложение

В панели Spaceship перезапустите Python приложение.

## 🧪 ТЕСТИРОВАНИЕ:

### Тест 1: Упрощенный логин (должен работать всегда)

```bash
curl -X POST https://zakup.one/api/v1/auth/login-simple \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6#"
```

**Ожидается:** JSON с `access_token` и `user`

### Тест 2: Основной логин

```bash
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6#"
```

**Ожидается:** JSON с `access` и `refresh` токенами

### Тест 3: Health check

```bash
curl https://zakup.one/api/v1/health
```

**Ожидается:** `{"status": "ok", "database": "connected"}`

## 🔍 ДИАГНОСТИКА:

### Если все еще 500:

1. **Проверьте логи в Spaceship** - там будет точная ошибка
2. **Проверьте зависимости:**
   ```bash
   python -c "import django; print(django.get_version())"
   python -c "import rest_framework; print('DRF OK')"
   python -c "import rest_framework_simplejwt; print('JWT OK')"
   ```
3. **Проверьте миграции:**
   ```bash
   python manage.py showmigrations
   ```
4. **Проверьте пользователя:**
   ```bash
   python manage.py shell
   ```
   ```python
   from apps.users.models import User
   print(User.objects.count())
   print(User.objects.filter(email='asannameg@gmail.com').exists())
   ```

## 📋 ЧЕКЛИСТ:

- [ ] Django установлен
- [ ] DRF установлен
- [ ] JWT установлен
- [ ] Миграции применены
- [ ] Пользователь создан
- [ ] Код обновлен на сервере
- [ ] DEBUG=True в `.env`
- [ ] Приложение перезапущено
- [ ] `/api/v1/auth/login-simple` работает
- [ ] `/api/v1/auth/login` работает

## 🎯 ГЛАВНОЕ:

**Если `/api/v1/auth/login` не работает, используйте `/api/v1/auth/login-simple` - он проще и надежнее!**

**Все ошибки теперь возвращают JSON вместо HTML!**

