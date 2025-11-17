"""
URLs для товаров
"""
from django.urls import path
from . import views

urlpatterns = [
    path('search', views.search_products, name='search_products'),
    path('<int:product_id>', views.get_product, name='get_product'),
]

