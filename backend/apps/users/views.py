from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .permissions import IsAdminRole
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import JSONParser
from django.contrib.auth import authenticate, login
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
import logging

logger = logging.getLogger(__name__)
from .models import User, Company, SavedCompany, SavedAddress, SavedRecipient, SubscriptionPlan, UserSubscription, UserCompany
from .serializers import (
    UserSerializer, UserCreateUpdateSerializer, RegisterSerializer,
    CompanySerializer, CompanyCreateUpdateSerializer, CompanyApproveSerializer,
    SavedCompanySerializer, SavedAddressSerializer, SavedRecipientSerializer,
    SubscriptionPlanSerializer, UserSubscriptionSerializer, UserCompanySerializer
)
from .utils import send_email_verification, send_registration_submitted_email, send_admin_notification_email


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # Отключаем аутентификацию для логина
    parser_classes = [JSONParser]  # Явно указываем парсер JSON
    
    def post(self, request):
        # Логируем запрос для отладки
        logger.info(f"=== LOGIN REQUEST ===")
        logger.info(f"Method: {request.method}")
        logger.info(f"Content-Type: {request.content_type}")
        logger.info(f"Headers: {dict(request.headers)}")
        logger.info(f"Has data attr: {hasattr(request, 'data')}")
        
        # Получаем данные из request.data (DRF автоматически парсит JSON)
        try:
            if hasattr(request, 'data'):
                logger.info(f"Request.data: {request.data}")
                email = request.data.get('email')
                password = request.data.get('password')
            else:
                email = None
                password = None
            
            # Если request.data пуст, пробуем распарсить JSON из body вручную
            if not email or not password:
                import json
                try:
                    body_str = request.body.decode('utf-8') if hasattr(request, 'body') else ''
                    logger.info(f"Request body: {body_str[:200]}")
                    body_data = json.loads(body_str)
                    email = body_data.get('email')
                    password = body_data.get('password')
                except (json.JSONDecodeError, AttributeError, UnicodeDecodeError) as e:
                    logger.error(f"Error parsing JSON: {str(e)}")
                    return Response({'error': f'Неверный формат данных: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error in login view: {str(e)}", exc_info=True)
            return Response({'error': f'Ошибка обработки запроса: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        logger.info(f"Email: {email}, Password: {'*' * len(password) if password else None}")
        
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
            
            response = Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })

            if user.role == 'ADMIN':
                # Создаем сессию для поддержки аутентификации
                # В DRF нужно использовать request._request для доступа к оригинальному WSGIRequest
                if hasattr(request, '_request'):
                    login(request._request, user)
                    # Убеждаемся, что сессия сохранена
                    request._request.session.save()
                # Устанавливаем заголовки для поддержки кросс-доменных cookies
                response['Access-Control-Allow-Credentials'] = 'true'
            
            return response
        return Response({'error': 'Неверные учетные данные'}, status=status.HTTP_401_UNAUTHORIZED)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # Отключаем аутентификацию для регистрации

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Автоматически помечаем email как подтвержденный
            user.email_verified = True
            user.email_verification_token = None
            user.save()
            
            # Отправляем письмо пользователю о том, что заявка отправлена администратору
            send_registration_submitted_email(user)
            
            # Отправляем уведомление администратору
            send_admin_notification_email(user)
            
            # НЕ создаем токен и НЕ логиним пользователя
            return Response({
                'message': 'Регистрация успешна! Ваша заявка отправлена администратору для рассмотрения. После одобрения вы сможете войти в систему.'
            }, status=status.HTTP_201_CREATED)
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
    permission_classes = [IsAdminRole]

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
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return User.objects.all().order_by('-date_joined')


class CompanyViewSet(ModelViewSet):
    queryset = Company.objects.all()
    permission_classes = [IsAdminRole]

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


class SavedCompanyViewSet(ModelViewSet):
    serializer_class = SavedCompanySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedCompany.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SavedAddressViewSet(ModelViewSet):
    serializer_class = SavedAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SavedRecipientViewSet(ModelViewSet):
    serializer_class = SavedRecipientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedRecipient.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SubscriptionPlanViewSet(ModelViewSet):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [AllowAny]  # Планы видны всем, но подписка только для авторизованных

    def get_queryset(self):
        return SubscriptionPlan.objects.filter(is_active=True).order_by('price')


class UserSubscriptionViewSet(ModelViewSet):
    serializer_class = UserSubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserSubscription.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Создание подписки с упрощенной логикой
        """
        try:
            # Получаем plan_id из запроса
            plan_id = request.data.get('plan_id')
            if not plan_id:
                return Response(
                    {'detail': 'Поле plan_id обязательно', 'plan_id': ['Это поле обязательно.']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Проверяем существование плана
            try:
                plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
            except SubscriptionPlan.DoesNotExist:
                return Response(
                    {'detail': 'План подписки не найден или неактивен', 'plan_id': ['Неверный ID плана.']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Проверяем активную подписку
            from django.utils import timezone
            existing_active = UserSubscription.objects.filter(
                user=request.user,
                status='ACTIVE'
            ).first()
            
            if existing_active and existing_active.end_date > timezone.now():
                return Response(
                    {'detail': 'У вас уже есть активная подписка. Отмените текущую подписку перед оформлением новой.'},
                    status=status.HTTP_409_CONFLICT
                )
            
            # Отменяем старую активную подписку если есть
            if existing_active:
                existing_active.status = 'CANCELLED'
                existing_active.save()
            
            # Создаем новую подписку
            from datetime import timedelta
            start_date = timezone.now()
            end_date = start_date + timedelta(days=30)
            
            subscription = UserSubscription.objects.create(
                user=request.user,
                plan=plan,
                status='ACTIVE',
                start_date=start_date,
                end_date=end_date,
                companies_count=1
            )
            
            # Возвращаем через serializer для правильного формата
            serializer = self.get_serializer(subscription)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            import traceback
            logger.error(f"Error creating subscription: {e}\n{traceback.format_exc()}")
            return Response(
                {'detail': f'Ошибка при создании подписки: {str(e)}', 'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def perform_create(self, serializer):
        # Этот метод больше не используется, логика перенесена в create()
        # Оставляем для совместимости, но не используем
        pass

    @action(detail=True, methods=['post'])
    def add_company(self, request, pk=None):
        """Добавить дополнительную компанию к подписке"""
        subscription = self.get_object()
        if not subscription.is_active:
            return Response({'error': 'Подписка не активна'}, status=status.HTTP_400_BAD_REQUEST)
        if not subscription.can_add_company:
            return Response({'error': 'Достигнут лимит компаний'}, status=status.HTTP_400_BAD_REQUEST)
        
        subscription.companies_count += 1
        subscription.save()
        return Response(UserSubscriptionSerializer(subscription).data)

    @action(detail=True, methods=['post'])
    def use_delivery(self, request, pk=None):
        """Использовать одну доставку"""
        subscription = self.get_object()
        if not subscription.is_active:
            return Response({'error': 'Подписка не активна'}, status=status.HTTP_400_BAD_REQUEST)
        if not subscription.has_delivery_available:
            return Response({'error': 'Доставки недоступны'}, status=status.HTTP_400_BAD_REQUEST)
        
        subscription.delivery_count_used += 1
        subscription.save()
        return Response(UserSubscriptionSerializer(subscription).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Отменить активную подписку"""
        subscription = self.get_object()
        
        # Проверяем, что подписка принадлежит текущему пользователю
        if subscription.user != request.user:
            return Response(
                {'error': 'У вас нет доступа к этой подписке'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Проверяем, что подписка активна
        if not subscription.is_active:
            return Response(
                {'error': 'Подписка уже неактивна'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Отменяем подписку
        subscription.status = 'CANCELLED'
        subscription.save()
        
        serializer = self.get_serializer(subscription)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserCompanyViewSet(ModelViewSet):
    serializer_class = UserCompanySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserCompany.objects.filter(user=self.request.user, is_active=True)

    def create(self, request, *args, **kwargs):
        """Создание компании с проверкой ограничений тарифа"""
        user = request.user
        
        # Получаем активную подписку
        try:
            subscription = UserSubscription.objects.filter(
                user=user,
                status='ACTIVE'
            ).select_related('plan').first()
            
            if not subscription or not subscription.is_active:
                return Response({
                    'error': 'У вас нет активной подписки'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Проверяем количество компаний
            current_companies_count = UserCompany.objects.filter(user=user, is_active=True).count()
            
            if current_companies_count >= subscription.plan.max_companies:
                additional_price = subscription.plan.additional_company_price
                return Response({
                    'error': f'Достигнут лимит компаний для вашего тарифа',
                    'message': f'Для оформления счёта на новую компанию необходимо оплатить {additional_price} сом',
                    'additional_price': str(additional_price),
                    'can_add': False
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'error': 'Ошибка проверки подписки',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
