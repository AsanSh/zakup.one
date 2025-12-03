from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import LoginView, RegisterView, CurrentUserView

app_name = 'users'

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
]


