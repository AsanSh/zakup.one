"""
URLs для админ-панели
"""
from django.urls import path
from .views import get_users, get_products, get_orders_admin

urlpatterns = [
    path('users', get_users, name='get_users'),
    path('products', get_products, name='get_products'),
    path('orders', get_orders_admin, name='get_orders_admin'),
]

