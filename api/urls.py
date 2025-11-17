"""
API URLs для zakup.one
"""
from django.urls import path, include

urlpatterns = [
    path('auth/', include('api.auth.urls')),
    path('products/', include('api.products.urls')),
    path('orders/', include('api.orders.urls')),
    path('admin/', include('api.admin.urls')),
]

