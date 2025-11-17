"""
Views для аутентификации
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer, 
    UserCreateSerializer, 
    CustomTokenObtainPairSerializer
)

User = get_user_model()


class LoginView(TokenObtainPairView):
    """Вход в систему"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        # Поддержка form-data (как в FastAPI OAuth2PasswordRequestForm)
        if request.content_type == 'application/x-www-form-urlencoded':
            # Преобразуем form-data: username -> email
            if 'username' in request.data:
                # Создаем копию QueryDict и изменяем её
                data = request.data.copy()
                data['email'] = data.pop('username')
                request._full_data = data
        
        try:
            return super().post(request, *args, **kwargs)
        except Exception as e:
            # Обработка ошибок с возвратом JSON
            import traceback
            from rest_framework.response import Response
            from rest_framework import status
            
            error_detail = str(e)
            if settings.DEBUG:
                error_detail += f"\n{traceback.format_exc()}"
            
            return Response(
                {
                    "detail": error_detail,
                    "type": type(e).__name__
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

