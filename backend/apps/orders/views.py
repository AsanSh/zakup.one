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
    http_method_names = ['get', 'post', 'patch', 'put', 'delete', 'head', 'options']

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
    
    def create(self, request, *args, **kwargs):
        """Создание трекинга с проверкой прав"""
        if request.user.role != 'ADMIN':
            return Response({'error': 'Только администратор может создавать трекинг'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        order_id = request.data.get('order')
        if not order_id:
            return Response({'error': 'Не указан заказ'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Заказ не найден'}, status=status.HTTP_404_NOT_FOUND)
        
        # Проверяем, не существует ли уже трекинг
        try:
            tracking = DeliveryTracking.objects.get(order=order)
            created = False
        except DeliveryTracking.DoesNotExist:
            tracking = DeliveryTracking.objects.create(
                order=order,
                status=request.data.get('status', 'WAITING_FOR_DRIVER'),
                driver_name=request.data.get('driver_name', '') or None,
                driver_phone=request.data.get('driver_phone', '') or None,
                vehicle_number=request.data.get('vehicle_number', '') or None,
                pickup_address=request.data.get('pickup_address', '') or None,
                pickup_lat=float(request.data.get('pickup_lat')) if request.data.get('pickup_lat') else None,
                pickup_lng=float(request.data.get('pickup_lng')) if request.data.get('pickup_lng') else None,
                items_count=order.items.count()
            )
            created = True
        
        if not created:
            # Обновляем существующий трекинг
            if 'status' in request.data:
                tracking.status = request.data.get('status')
            if 'driver_name' in request.data:
                tracking.driver_name = request.data.get('driver_name') or None
            if 'driver_phone' in request.data:
                tracking.driver_phone = request.data.get('driver_phone') or None
            if 'vehicle_number' in request.data:
                tracking.vehicle_number = request.data.get('vehicle_number') or None
            if 'pickup_address' in request.data:
                tracking.pickup_address = request.data.get('pickup_address') or None
            if 'pickup_lat' in request.data:
                pickup_lat = request.data.get('pickup_lat')
                tracking.pickup_lat = float(pickup_lat) if pickup_lat else None
            if 'pickup_lng' in request.data:
                pickup_lng = request.data.get('pickup_lng')
                tracking.pickup_lng = float(pickup_lng) if pickup_lng else None
            tracking.save()
        
        serializer = DeliveryTrackingSerializer(tracking)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    def list(self, request, *args, **kwargs):
        """
        Переопределяем list для обработки трекинга.
        ВСЕГДА возвращает 200, даже если трекинг неактивен.
        """
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
                    
                    # Проверяем подписку пользователя
                    from apps.users.models import UserSubscription
                    subscription = UserSubscription.objects.filter(
                        user=order.client,
                        status='ACTIVE'
                    ).select_related('plan').first()
                    
                    # Проверяем оплату заказа
                    is_paid = order.status in ['PAID', 'IN_PROGRESS', 'COLLECTED', 'IN_DELIVERY', 'DELIVERED']
                    
                    # Проверяем доступ к трекингу по подписке
                    has_tracking_subscription = (subscription and 
                                               subscription.is_active and 
                                               subscription.plan.delivery_tracking_available)
                    
                    # Вычисляем is_active: заказ должен быть оплачен И подписка должна позволять трекинг
                    is_active = is_paid and has_tracking_subscription
                    
                    # Получаем или создаем трекинг
                    tracking = DeliveryTracking.objects.filter(order_id=order_id_int).first()
                    if not tracking:
                        tracking = DeliveryTracking.objects.create(
                            order=order,
                            status='WAITING_FOR_DRIVER',
                            items_count=order.items.count()
                        )
                    
                    # Обновляем is_active в трекинге
                    tracking.is_active = is_active
                    tracking.save()
                    
                    # Сериализуем данные
                    serializer = DeliveryTrackingSerializer(tracking)
                    data = serializer.data
                    
                    # Если трекинг неактивен, добавляем сообщение
                    if not is_active:
                        if not is_paid:
                            data['message'] = 'Трекинг доставки становится доступным после оплаты заказа'
                        elif not has_tracking_subscription:
                            plan_name = subscription.plan.name if subscription and subscription.plan else 'Базовый'
                            data['message'] = f'Трекинг доступен только для тарифов Стандарт и VIP. Ваш тариф: {plan_name}'
                    
                    # ВСЕГДА возвращаем 200
                    return Response(data, status=status.HTTP_200_OK)
                    
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
        
        if new_status and new_status not in dict(DeliveryTracking.STATUS_CHOICES):
            return Response({'error': 'Неверный статус'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Обновляем данные водителя если переданы
        if 'driver_name' in request.data:
            tracking.driver_name = request.data.get('driver_name') or None
        if 'driver_phone' in request.data:
            tracking.driver_phone = request.data.get('driver_phone') or None
        if 'vehicle_number' in request.data:
            tracking.vehicle_number = request.data.get('vehicle_number') or None
        
        # Обновляем адрес погрузки если передан
        if 'pickup_address' in request.data:
            tracking.pickup_address = request.data.get('pickup_address') or None
        if 'pickup_lat' in request.data:
            pickup_lat = request.data.get('pickup_lat')
            tracking.pickup_lat = float(pickup_lat) if pickup_lat else None
        if 'pickup_lng' in request.data:
            pickup_lng = request.data.get('pickup_lng')
            tracking.pickup_lng = float(pickup_lng) if pickup_lng else None
        
        # Обновляем статус если передан
        if new_status:
            tracking.update_status(new_status, operator=request.user)
        else:
            tracking.save()
        
        return Response(DeliveryTrackingSerializer(tracking).data)
    
    def partial_update(self, request, pk=None):
        """Обновление трекинга через PATCH"""
        if request.user.role != 'ADMIN':
            return Response({'error': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)
        
        tracking = self.get_object()
        
        # Обновляем поля
        if 'status' in request.data:
            new_status = request.data.get('status')
            if new_status not in dict(DeliveryTracking.STATUS_CHOICES):
                return Response({'error': 'Неверный статус'}, status=status.HTTP_400_BAD_REQUEST)
            tracking.update_status(new_status, operator=request.user)
        
        # Обновляем остальные поля
        serializer = DeliveryTrackingSerializer(tracking, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



