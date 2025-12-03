from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
from .models import User, Company
from .serializers import UserSerializer, RegisterSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # Отключаем аутентификацию для логина

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email и пароль обязательны'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=email, password=password)
        if user and user.is_active:
            token, created = Token.objects.get_or_create(user=user)
            # Создаем Django сессию для доступа к админке (только для админов)
            if user.role == 'ADMIN':
                login(request, user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Неверные учетные данные'}, status=status.HTTP_401_UNAUTHORIZED)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # Отключаем аутентификацию для регистрации

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            # Создаем Django сессию только для админов
            if user.role == 'ADMIN':
                login(request, user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
