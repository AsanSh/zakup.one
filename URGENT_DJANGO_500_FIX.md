# 🚨 СРОЧНОЕ ИСПРАВЛЕНИЕ 500 ОШИБКИ В DJANGO

## ❌ Проблема
При логине возвращается **HTML страница ошибки** вместо JSON. Это означает что Django падает с необработанным исключением.

## ✅ Решение: 5 шагов

### ШАГ 1: Установить Django зависимости (КРИТИЧНО!)

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip install Django djangorestframework djangorestframework-simplejwt django-cors-headers dj-database-url python-dotenv
```

Или полный список:
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
- `django_project/zakup_one/urls.py`

### ШАГ 5: Включить DEBUG и перезапустить

В `.env`:
```env
DEBUG=True
```

В панели Spaceship перезапустите приложение.

## 🔍 Диагностика через логи

В панели Spaceship найдите логи приложения. Там будет **точная ошибка** с traceback.

### Типичные ошибки:

1. **"No module named 'django'"**
   - Решение: `pip install Django`

2. **"No module named 'rest_framework'"**
   - Решение: `pip install djangorestframework`

3. **"apps.users.models.User.DoesNotExist"**
   - Решение: Создайте пользователя (Шаг 3)

4. **"relation 'users' does not exist"**
   - Решение: `python manage.py migrate`

5. **"AUTH_USER_MODEL refers to model 'users.User' that has not been installed"**
   - Решение: Проверьте что `apps.users` в `INSTALLED_APPS`

## 🧪 Тест напрямую

```bash
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6#" \
  -v
```

**Если возвращает HTML** - Django падает с ошибкой. Проверьте логи!

**Если возвращает JSON** - значит работает!

## 📋 Чеклист

- [ ] Django установлен: `python -c "import django; print(django.get_version())"`
- [ ] DRF установлен: `python -c "import rest_framework; print('OK')"`
- [ ] JWT установлен: `python -c "import rest_framework_simplejwt; print('OK')"`
- [ ] Миграции применены: `python manage.py migrate`
- [ ] Пользователь создан
- [ ] Код обновлен на сервере
- [ ] DEBUG=True в `.env`
- [ ] Приложение перезапущено
- [ ] Логи проверены

## 🎯 Главное

**500 ошибка с HTML ответом = Django падает с необработанным исключением**

**Решение:**
1. Установите все зависимости
2. Примените миграции
3. Создайте пользователя
4. Проверьте логи для точной ошибки

**После исправления должно вернуться JSON с токеном!**

