"""
URLs для админ API
"""
from django.urls import path
from . import views

urlpatterns = [
    path('suppliers', views.get_suppliers, name='get_suppliers'),
    path('suppliers', views.create_supplier, name='create_supplier'),
    path('import-price-list', views.import_price_list, name='import_price_list'),
    path('users', views.get_users, name='get_users'),
    path('orders', views.get_orders_admin, name='get_orders_admin'),
]

