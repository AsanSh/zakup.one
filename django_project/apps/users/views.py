"""
Views для аутентификации
"""
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from django.conf import settings
from .serializers import (
    UserSerializer, 
    UserCreateSerializer, 
    CustomTokenObtainPairSerializer
)

User = get_user_model()


class LoginView(TokenObtainPairView):
    """Вход в систему"""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        try:
            # Обработка form-data
            data = {}
            if request.content_type == 'application/x-www-form-urlencoded':
                # Получаем данные из form-data
                email = request.POST.get('email') or request.POST.get('username')
                password = request.POST.get('password')
                if email and password:
                    data = {'email': email, 'password': password}
            else:
                # JSON данные
                data = request.data.copy() if hasattr(request, 'data') else {}
                if 'username' in data and 'email' not in data:
                    data['email'] = data.pop('username')
            
            # Создаем новый request.data с правильными данными
            if data:
                request._full_data = data
            
            return super().post(request, *args, **kwargs)
        except Exception as e:
            # Обработка ошибок с возвратом JSON
            import traceback
            error_detail = str(e)
            traceback_str = ""
            
            if settings.DEBUG:
                traceback_str = traceback.format_exc()
            
            return Response(
                {
                    "detail": error_detail,
                    "type": type(e).__name__,
                    "traceback": traceback_str if settings.DEBUG else None
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_simple(request):
    """Упрощенный логин для отладки"""
    try:
        # Получаем email/username и password
        email = None
        password = None
        
        if request.content_type == 'application/x-www-form-urlencoded':
            email = request.POST.get('email') or request.POST.get('username')
            password = request.POST.get('password')
        else:
            email = request.data.get('email') or request.data.get('username')
            password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {"detail": "Email и пароль обязательны"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Аутентификация
        user = authenticate(username=email, password=password)
        
        if not user:
            return Response(
                {"detail": "Неверный email или пароль"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {"detail": "Аккаунт деактивирован"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not user.is_admin and not user.is_verified:
            return Response(
                {"detail": "Аккаунт не верифицирован администратором"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Создаем токены
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'token_type': 'bearer',
            'user': UserSerializer(user).data
        })
    except Exception as e:
        import traceback
        return Response(
            {
                "detail": str(e),
                "type": type(e).__name__,
                "traceback": traceback.format_exc() if settings.DEBUG else None
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """Регистрация нового пользователя"""
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Отправка email уведомления (можно добавить позже)
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_me(request):
    """Получить информацию о текущем пользователе"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
