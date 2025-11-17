"""
URLs для заявок
"""
from django.urls import path
from .views import create_order, get_orders, get_order_tracking

urlpatterns = [
    path('', create_order, name='create_order'),
    path('list', get_orders, name='get_orders'),
    path('<int:order_id>/tracking', get_order_tracking, name='get_order_tracking'),
]

