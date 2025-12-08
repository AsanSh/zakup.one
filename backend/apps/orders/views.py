from rest_framework import status
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer, OrderUpdateSerializer


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



