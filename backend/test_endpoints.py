#!/usr/bin/env python
"""
Тестовый скрипт для проверки критических endpoints
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'zakup_backend.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from apps.orders.models import Order, DeliveryTracking
from apps.users.models import UserSubscription, SubscriptionPlan

User = get_user_model()

def test_endpoints():
    """Проверка основных endpoints"""
    print("=" * 60)
    print("ТЕСТИРОВАНИЕ ENDPOINTS")
    print("=" * 60)
    
    # Создаем тестового пользователя
    user, created = User.objects.get_or_create(
        email='test@example.com',
        defaults={'full_name': 'Test User', 'role': 'CLIENT'}
    )
    if created:
        user.set_password('test123')
        user.save()
        print(f"✓ Создан тестовый пользователь: {user.email}")
    
    # Получаем токен
    token, _ = Token.objects.get_or_create(user=user)
    print(f"✓ Токен: {token.key[:20]}...")
    
    client = Client()
    
    # Тест 1: GET /api/orders/
    print("\n1. Тест GET /api/orders/")
    response = client.get('/api/orders/', HTTP_AUTHORIZATION=f'Token {token.key}')
    print(f"   Статус: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        orders_count = len(data.get('results', data if isinstance(data, list) else []))
        print(f"   ✓ Успешно. Заказов: {orders_count}")
    else:
        print(f"   ✗ Ошибка: {response.content.decode()[:200]}")
    
    # Тест 2: GET /api/auth/subscription-plans/
    print("\n2. Тест GET /api/auth/subscription-plans/")
    response = client.get('/api/auth/subscription-plans/')
    print(f"   Статус: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        plans_count = len(data.get('results', data if isinstance(data, list) else []))
        print(f"   ✓ Успешно. Планов: {plans_count}")
    else:
        print(f"   ✗ Ошибка: {response.content.decode()[:200]}")
    
    # Тест 3: GET /api/orders/tracking/
    print("\n3. Тест GET /api/orders/tracking/")
    response = client.get('/api/orders/tracking/', HTTP_AUTHORIZATION=f'Token {token.key}')
    print(f"   Статус: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        tracking_count = len(data.get('results', data if isinstance(data, list) else []))
        print(f"   ✓ Успешно. Трекингов: {tracking_count}")
    else:
        print(f"   ✗ Ошибка: {response.content.decode()[:200]}")
    
    # Тест 4: Проверка моделей
    print("\n4. Проверка моделей")
    print(f"   Orders: {Order.objects.count()}")
    print(f"   Tracking: {DeliveryTracking.objects.count()}")
    print(f"   Subscriptions: {UserSubscription.objects.count()}")
    print(f"   Plans: {SubscriptionPlan.objects.count()}")
    
    print("\n" + "=" * 60)
    print("ТЕСТИРОВАНИЕ ЗАВЕРШЕНО")
    print("=" * 60)

if __name__ == '__main__':
    test_endpoints()



