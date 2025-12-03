from rest_framework import status
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer, OrderUpdateSerializer


class OrderListView(ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Order.objects.all()
        return Order.objects.filter(client=user)


class OrderCreateView(CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        # Если у пользователя нет компании, создаем заявку без компании или используем None
        company = user.company if hasattr(user, 'company') and user.company else None
        serializer.save(client=user, company=company)


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



