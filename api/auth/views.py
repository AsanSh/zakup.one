"""
API views для аутентификации
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from users.models import User
from .serializers import UserSerializer, UserCreateSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Вход в систему
    Ожидает: username (email) и password в form-data
    """
    email = request.data.get('username') or request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'detail': 'Необходимо указать email и пароль'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'detail': 'Неверный email или пароль'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Проверка пароля
    if not user.check_password(password):
        return Response(
            {'detail': 'Неверный email или пароль'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Проверка активности
    if not user.is_active:
        return Response(
            {'detail': 'Аккаунт деактивирован'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Проверка верификации (админы могут входить без верификации)
    if not user.is_admin and not user.is_verified:
        return Response(
            {'detail': 'Аккаунт не верифицирован администратором'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Создание токена
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    
    return Response({
        'access_token': access_token,
        'token_type': 'bearer',
        'user': UserSerializer(user).data
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Регистрация нового пользователя
    """
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """
    Получить информацию о текущем пользователе
    """
    return Response(UserSerializer(request.user).data)

