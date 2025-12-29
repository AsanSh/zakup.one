"""
Тесты для создания подписки
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import SubscriptionPlan, UserSubscription

User = get_user_model()


class SubscriptionCreateTestCase(TestCase):
    """Тесты создания подписки"""
    
    def setUp(self):
        """Настройка тестовых данных"""
        # Создаем пользователя
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            full_name='Test User',
            role='CLIENT'
        )
        
        # Создаем планы подписки
        self.basic_plan = SubscriptionPlan.objects.create(
            plan_type='BASIC',
            name='Базовый',
            price=2000,
            max_companies=1,
            delivery_tracking_available=False,
            installment_available=False,
            is_active=True
        )
        
        self.standard_plan = SubscriptionPlan.objects.create(
            plan_type='STANDARD',
            name='Стандарт',
            price=5000,
            max_companies=3,
            delivery_tracking_available=True,
            installment_available=False,
            is_active=True
        )
        
        self.vip_plan = SubscriptionPlan.objects.create(
            plan_type='VIP',
            name='VIP',
            price=20000,
            max_companies=5,
            delivery_tracking_available=True,
            installment_available=True,
            is_active=True
        )
        
        # Создаем API клиент
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
    
    def test_create_subscription_success(self):
        """Тест успешного создания подписки"""
        response = self.client.post(
            '/api/auth/subscriptions/',
            {'plan_id': self.basic_plan.id},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['plan']['id'], self.basic_plan.id)
        self.assertEqual(response.data['status'], 'ACTIVE')
        
        # Проверяем что подписка создана в БД
        subscription = UserSubscription.objects.get(user=self.user, plan=self.basic_plan)
        self.assertIsNotNone(subscription)
        self.assertIsNotNone(subscription.end_date)
    
    def test_create_subscription_with_active_existing(self):
        """Тест создания подписки при наличии активной"""
        # Создаем активную подписку
        UserSubscription.objects.create(
            user=self.user,
            plan=self.basic_plan,
            status='ACTIVE',
            start_date=timezone.now(),
            end_date=timezone.now() + timezone.timedelta(days=30)
        )
        
        # Пытаемся создать новую
        response = self.client.post(
            '/api/auth/subscriptions/',
            {'plan_id': self.standard_plan.id},
            format='json'
        )
        
        # Должна вернуться 409 Conflict
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
    
    def test_create_subscription_invalid_plan_id(self):
        """Тест создания подписки с неверным plan_id"""
        response = self.client.post(
            '/api/auth/subscriptions/',
            {'plan_id': 99999},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)
    
    def test_create_subscription_missing_plan_id(self):
        """Тест создания подписки без plan_id"""
        response = self.client.post(
            '/api/auth/subscriptions/',
            {},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('plan_id', response.data or {})
    
    def test_create_subscription_returns_json(self):
        """Тест что ответ всегда JSON, не HTML"""
        response = self.client.post(
            '/api/auth/subscriptions/',
            {'plan_id': self.basic_plan.id},
            format='json'
        )
        
        # Проверяем что ответ JSON
        self.assertEqual(response['Content-Type'], 'application/json')
        self.assertIsInstance(response.data, dict)

