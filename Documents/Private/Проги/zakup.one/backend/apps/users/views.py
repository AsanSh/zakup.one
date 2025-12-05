from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.viewsets import ModelViewSet
from django.contrib.auth import authenticate, login
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
from .models import User, Company
from .serializers import (
    UserSerializer, UserCreateUpdateSerializer, RegisterSerializer,
    CompanySerializer, CompanyCreateUpdateSerializer, CompanyApproveSerializer
)
from .utils import send_email_verification, send_registration_submitted_email, send_admin_notification_email


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
            # Для клиентов проверяем одобрение компании
            if user.role == 'CLIENT' and user.company and not user.company.approved:
                return Response({
                    'error': 'Ваша заявка находится на рассмотрении администратора. Ожидайте одобрения.'
                }, status=status.HTTP_403_FORBIDDEN)
            
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
            try:
                user = serializer.save()
                # Автоматически помечаем email как подтвержденный
                user.email_verified = True
                user.email_verification_token = None
                user.save()
                
                # Отправляем письмо пользователю о том, что заявка отправлена администратору
                try:
                    send_registration_submitted_email(user)
                except Exception as e:
                    # Логируем ошибку, но не прерываем регистрацию
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f'Ошибка отправки email пользователю {user.email}: {str(e)}')
                
                # Отправляем уведомление администратору
                try:
                    send_admin_notification_email(user)
                except Exception as e:
                    # Логируем ошибку, но не прерываем регистрацию
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f'Ошибка отправки уведомления администратору о регистрации {user.email}: {str(e)}')
                
                # НЕ создаем токен и НЕ логиним пользователя
                return Response({
                    'message': 'Регистрация успешна! Ваша заявка отправлена администратору для рассмотрения. После одобрения вы сможете войти в систему.'
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                # Логируем общую ошибку регистрации
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f'Ошибка при регистрации пользователя: {str(e)}', exc_info=True)
                return Response({
                    'error': 'Ошибка при создании аккаунта. Попробуйте еще раз.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Токен обязателен'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email_verification_token=token, email_verified=False)
            user.email_verified = True
            user.email_verification_token = None
            user.save()
            
            # Отправляем письмо пользователю о том, что заявка отправлена администратору
            send_registration_submitted_email(user)
            
            # Отправляем уведомление администратору
            send_admin_notification_email(user)
            
            return Response({
                'message': 'Email успешно подтвержден! Ваша заявка отправлена администратору. Ожидайте одобрения.'
            })
        except User.DoesNotExist:
            return Response({'error': 'Неверный или устаревший токен'}, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if role:
            queryset = queryset.filter(role=role)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('-date_joined')


class UserListView(ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return User.objects.all().order_by('-date_joined')


class CompanyViewSet(ModelViewSet):
    queryset = Company.objects.all()
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CompanyCreateUpdateSerializer
        elif self.action == 'approve':
            return CompanyApproveSerializer
        return CompanySerializer

    def get_queryset(self):
        queryset = Company.objects.all()
        approved = self.request.query_params.get('approved', None)
        
        if approved is not None:
            queryset = queryset.filter(approved=approved.lower() == 'true')
        
        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Одобрение или отклонение компании"""
        company = self.get_object()
        serializer = CompanyApproveSerializer(data=request.data)
        
        if serializer.is_valid():
            approved = serializer.validated_data['approved']
            company.approved = approved
            company.approved_by = request.user
            company.approved_at = timezone.now()
            
            if not approved:
                company.rejection_reason = serializer.validated_data.get('rejection_reason', '')
            else:
                company.rejection_reason = ''
            
            company.save()
            return Response(CompanySerializer(company).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
