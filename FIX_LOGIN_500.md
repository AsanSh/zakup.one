# 🔧 ИСПРАВЛЕНИЕ 500 ОШИБКИ ПРИ ЛОГИНЕ

## ❌ Проблема
При попытке логина возвращается 500 Internal Server Error вместо JSON ответа.

## ✅ Решение

### ШАГ 1: Проверить что Django зависимости установлены

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip install -r requirements_django.txt
```

### ШАГ 2: Проверить что миграции применены

```bash
cd /home/kdlqemdxxn/zakup.one/django_project
python manage.py migrate
```

### ШАГ 3: Проверить что пользователь существует

```bash
python manage.py shell
```

В shell:
```python
from apps.users.models import User
user = User.objects.filter(email='asannameg@gmail.com').first()
if user:
    print(f"User exists: {user.email}, is_admin: {user.is_admin}, is_active: {user.is_active}")
else:
    print("User not found - need to create")
```

Если пользователя нет - создайте:
```bash
python manage.py createsuperuser
```

### ШАГ 4: Обновить код на сервере

Скопируйте обновленные файлы:
- `django_project/apps/users/views.py`
- `django_project/apps/users/serializers.py`

### ШАГ 5: Включить DEBUG для диагностики

В `.env`:
```env
DEBUG=True
```

### ШАГ 6: Проверить логи

В панели Spaceship найдите логи приложения и проверьте traceback ошибки.

## 🔍 Диагностика

### Проверка 1: Django установлен?

```bash
python -c "import django; print(django.get_version())"
```

### Проверка 2: DRF установлен?

```bash
python -c "import rest_framework; print('OK')"
```

### Проверка 3: JWT установлен?

```bash
python -c "import rest_framework_simplejwt; print('OK')"
```

### Проверка 4: Тест логина напрямую

```bash
curl -X POST https://zakup.one/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=asannameg@gmail.com&password=ParolJok6#"
```

Если возвращает HTML вместо JSON - проблема в обработке ошибок Django.

## 🆘 Если все еще 500

### Временное решение: Упрощенный LoginView

Если проблема в сериализаторе, попробуйте упрощенную версию:

```python
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_simple(request):
    """Упрощенный логин"""
    from rest_framework_simplejwt.tokens import RefreshToken
    from django.contrib.auth import authenticate
    
    email = request.data.get('email') or request.data.get('username')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {"detail": "Email и пароль обязательны"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=email, password=password)
    
    if not user:
        return Response(
            {"detail": "Неверный email или пароль"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.is_active:
        return Response(
            {"detail": "Аккаунт деактивирован"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if not user.is_admin and not user.is_verified:
        return Response(
            {"detail": "Аккаунт не верифицирован"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
        'token_type': 'bearer',
        'user': UserSerializer(user).data
    })
```

## 📋 Чеклист

- [ ] Django зависимости установлены
- [ ] Миграции применены
- [ ] Пользователь существует в базе
- [ ] `django_project/apps/users/views.py` обновлен
- [ ] `django_project/apps/users/serializers.py` обновлен
- [ ] DEBUG=True в `.env` для диагностики
- [ ] Логи проверены на наличие ошибок

## 🎯 Главное

**500 ошибка при логине обычно означает:**
1. Django зависимости не установлены
2. Миграции не применены
3. Пользователь не существует
4. Ошибка в коде сериализатора/views

**После исправления должно вернуться JSON с токеном!**

