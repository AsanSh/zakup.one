"""
URLs для аутентификации
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, login_simple, register, get_me

urlpatterns = [
    path('login', LoginView.as_view(), name='login'),
    path('login-simple', login_simple, name='login_simple'),  # Упрощенный логин для отладки
    path('register', register, name='register'),
    path('me', get_me, name='me'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
]
