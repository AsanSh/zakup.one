from rest_framework import status
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from .models import Order, OrderItem, Invoice, DeliveryTracking
from .serializers import OrderSerializer, OrderCreateSerializer, OrderUpdateSerializer, InvoiceSerializer, DeliveryTrackingSerializer


class OrderViewSet(ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Админ видит все, клиент — только свои
        if user.role == 'ADMIN':
            queryset = Order.objects.all()
        else:
            queryset = Order.objects.filter(client=user)
        
        # Фильтрация по статусу (опционально)
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OrderUpdateSerializer
        return OrderSerializer

    def perform_create(self, serializer):
        """Устанавливаем client и company при создании заявки"""
        # client и company уже устанавливаются в сериализаторе через context
        # Не нужно передавать их снова, чтобы избежать конфликта
        serializer.save()

    @action(detail=True, methods=['patch'])
    def change_status(self, request, pk=None):
        """Изменение статуса заявки"""
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Неверный статус'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = new_status
        order.save()
        
        return Response(OrderSerializer(order).data)


class OrderListView(ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Отключаем пагинацию для этого view

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            queryset = Order.objects.all()
        else:
            queryset = Order.objects.filter(client=user)
        
        # Всегда сортируем по дате создания (новые сверху)
        return queryset.order_by('-created_at')


class OrderCreateView(CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        # client и company уже устанавливаются в сериализаторе через context
        serializer.save()


class OrderDetailView(RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Order.objects.all()
        return Order.objects.filter(client=user)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return OrderUpdateSerializer
        return OrderSerializer


class OrderDeleteView(DestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Order.objects.all()
        return Order.objects.filter(client=user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class OrderParseTextView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # TODO: Реализовать простой NLP парсинг текста
        return Response({'message': 'Функция в разработке'}, status=status.HTTP_501_NOT_IMPLEMENTED)


class OrderParseExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # TODO: Реализовать парсинг Excel файла
        return Response({'message': 'Функция в разработке'}, status=status.HTTP_501_NOT_IMPLEMENTED)


class OrderParseImageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # TODO: Реализовать OCR обработку изображения
        return Response({'message': 'Функция в разработке'}, status=status.HTTP_501_NOT_IMPLEMENTED)


class InvoiceViewSet(ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Invoice.objects.all()
        return Invoice.objects.filter(order__client=user)


class DeliveryTrackingViewSet(ModelViewSet):
    serializer_class = DeliveryTrackingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Права доступа
        if user.role == 'ADMIN':
            queryset = DeliveryTracking.objects.select_related('order').all()
        else:
            queryset = DeliveryTracking.objects.select_related('order').filter(order__client=user)
        
        # Фильтр по order_id из query params
        order_id = self.request.query_params.get('order', None)
        if order_id:
            try:
                queryset = queryset.filter(order_id=int(order_id))
            except (ValueError, TypeError):
                pass
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Переопределяем list для обработки случая когда трекинг не найден, но заказ существует"""
        order_id = request.query_params.get('order', None)
        
        if order_id:
            try:
                order_id_int = int(order_id)
                # Проверяем, существует ли заказ
                try:
                    order = Order.objects.get(id=order_id_int)
                    
                    # Проверяем права доступа
                    if request.user.role != 'ADMIN' and order.client != request.user:
                        return Response(
                            {'error': 'Доступ запрещен'},
                            status=status.HTTP_403_FORBIDDEN
                        )
                    
                    # Проверяем подписку пользователя (трекинг доступен только для Стандарт и VIP)
                    from apps.users.models import UserSubscription
                    subscription = UserSubscription.objects.filter(
                        user=order.client,
                        status='ACTIVE'
                    ).select_related('plan').first()
                    
                    # Проверяем наличие активной подписки с доступом к трекингу
                    has_tracking_access = (subscription and 
                                         subscription.is_active and 
                                         subscription.plan.delivery_tracking_available)
                    
                    if not has_tracking_access:
                        # Подписка не позволяет трекинг (Базовый тариф или нет подписки)
                        plan_name = subscription.plan.name if subscription and subscription.plan else 'Базовый'
                        return Response({
                            'locked': True,
                            'reason': f'Трекинг доступен только для тарифов Стандарт и VIP. Ваш тариф: {plan_name}',
                            'order': {
                                'id': order.id,
                                'order_number': order.order_number,
                                'status': order.status,
                                'status_label': dict(Order.STATUS_CHOICES).get(order.status, order.status)
                            }
                        })
                    
                    # Подписка позволяет трекинг - проверяем наличие трекинга
                    tracking = DeliveryTracking.objects.filter(order_id=order_id_int).first()
                    
                    if not tracking:
                        # Трекинг не создан - создаем его
                        tracking = DeliveryTracking.objects.create(
                            order=order,
                            status='ACCEPTED',
                            items_count=order.items.count()
                        )
                        return Response(DeliveryTrackingSerializer(tracking).data)
                    
                    # Трекинг существует - возвращаем его
                    return Response(DeliveryTrackingSerializer(tracking).data)
                    
                except Order.DoesNotExist:
                    return Response(
                        {'error': 'Заказ не найден'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            except (ValueError, TypeError):
                return Response(
                    {'error': 'Неверный ID заказа'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Если order_id не передан, возвращаем стандартный список
        return super().list(request, *args, **kwargs)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Обновить статус доставки (только для админов)"""
        if request.user.role != 'ADMIN':
            return Response({'error': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)
        
        tracking = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(DeliveryTracking.STATUS_CHOICES):
            return Response({'error': 'Неверный статус'}, status=status.HTTP_400_BAD_REQUEST)
        
        tracking.update_status(new_status, operator=request.user)
        return Response(DeliveryTrackingSerializer(tracking).data)



