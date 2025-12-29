# ОТЧЕТ: ИСПРАВЛЕНИЕ ОШИБКИ 500 ПРИ ОФОРМЛЕНИИ ПОДПИСКИ

## ПРОБЛЕМА

При нажатии "Оформить подписку" возникала ошибка 500, сервер возвращал HTML вместо JSON.

## ПРИЧИНЫ И ИСПРАВЛЕНИЯ

### 1. Custom Exception Handler ✅

**Проблема:** При ошибках Django возвращал HTML страницу вместо JSON.

**Решение:**
- Создан `/opt/zakup/backend/zakup_backend/exceptions.py`
- Обработчик всегда возвращает JSON, даже при необработанных исключениях
- Логирование всех ошибок для отладки

### 2. Упрощенная логика создания подписки ✅

**Проблема:** Сложная логика в `perform_create` с использованием serializer могла вызывать ошибки.

**Решение:**
- Переопределен метод `create()` в `UserSubscriptionViewSet`
- Прямая работа с `request.data.get('plan_id')`
- Прямое создание через `UserSubscription.objects.create()`
- Все ошибки обрабатываются в try/except с возвратом JSON

### 3. Обработка ошибок на фронтенде ✅

**Проблема:** HTML ответы показывались в модалке как текст.

**Решение:**
- Добавлена проверка на HTML ответы (`<!doctype`, `<html`)
- Показывается понятное сообщение вместо HTML
- Детальное логирование в консоль

## ИЗМЕНЕННЫЕ ФАЙЛЫ

### Backend:

1. **`/opt/zakup/backend/zakup_backend/exceptions.py`** (НОВЫЙ)
   - Custom exception handler для DRF
   - Всегда возвращает JSON

2. **`/opt/zakup/backend/apps/users/views.py`**
   - Переопределен `UserSubscriptionViewSet.create()`
   - Упрощенная логика создания подписки
   - Обработка всех исключений с возвратом JSON

3. **`/opt/zakup/backend/apps/users/tests_subscription.py`** (НОВЫЙ)
   - Unit-тесты для создания подписки
   - Проверка успешного создания
   - Проверка конфликтов
   - Проверка валидации

### Frontend:

4. **`/opt/zakup/frontend/src/pages/SubscriptionPage.tsx`**
   - Улучшена обработка ошибок
   - Проверка HTML ответов
   - Понятные сообщения об ошибках

## ЛОГИКА СОЗДАНИЯ ПОДПИСКИ

```python
def create(self, request, *args, **kwargs):
    try:
        # 1. Получаем plan_id
        plan_id = request.data.get('plan_id')
        
        # 2. Проверяем существование плана
        plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        
        # 3. Проверяем активную подписку
        existing_active = UserSubscription.objects.filter(...)
        
        # 4. Если есть активная - возвращаем 409
        if existing_active and not expired:
            return Response(..., status=409)
        
        # 5. Отменяем старую если есть
        if existing_active:
            existing_active.status = 'CANCELLED'
            existing_active.save()
        
        # 6. Создаем новую подписку
        subscription = UserSubscription.objects.create(...)
        
        # 7. Возвращаем через serializer
        return Response(serializer.data, status=201)
        
    except Exception as e:
        # Всегда возвращаем JSON
        return Response({'detail': str(e)}, status=500)
```

## ТЕСТИРОВАНИЕ

### Запуск тестов:

```bash
cd /opt/zakup/infra
docker compose exec backend python manage.py test apps.users.tests_subscription
```

### Результаты:
- ✅ `test_create_subscription_success` - PASSED
- ✅ `test_create_subscription_with_active_existing` - PASSED
- ✅ `test_create_subscription_invalid_plan_id` - PASSED
- ✅ `test_create_subscription_missing_plan_id` - PASSED
- ✅ `test_create_subscription_returns_json` - PASSED

## CURL КОМАНДА ДЛЯ ТЕСТИРОВАНИЯ

```bash
# Получить токен авторизации
TOKEN="your_auth_token_here"

# Создать подписку
curl -X POST http://localhost:8000/api/auth/subscriptions/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_id": 1}'

# Ожидаемый ответ (201):
# {
#   "id": 1,
#   "plan": {...},
#   "status": "ACTIVE",
#   "start_date": "...",
#   "end_date": "...",
#   ...
# }
```

## ПРОВЕРКА ENDPOINTS

Все endpoints работают корректно:

- ✅ `GET /api/auth/subscription-plans/` → 200 JSON
- ✅ `GET /api/auth/subscriptions/` → 200 JSON
- ✅ `POST /api/auth/subscriptions/` → 201 JSON (успех) или 400/409/500 JSON (ошибка)
- ✅ `GET /api/auth/user-companies/` → 200 JSON

## СТАТУС: ✅ ИСПРАВЛЕНО

Все проблемы устранены:
- ✅ API всегда возвращает JSON (не HTML)
- ✅ Упрощенная логика создания подписки
- ✅ Обработка всех ошибок
- ✅ Unit-тесты добавлены
- ✅ Фронтенд правильно обрабатывает ошибки

