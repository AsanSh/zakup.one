"""
URLs для заявок
"""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_orders, name='get_orders'),  # GET и POST
    path('<int:order_id>/tracking', views.get_order_tracking, name='get_order_tracking'),
    path('active-deliveries', views.get_active_deliveries, name='get_active_deliveries'),
]

