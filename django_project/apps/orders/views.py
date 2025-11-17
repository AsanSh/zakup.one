"""
Views для заявок
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer
from apps.products.models import Product


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """Создание заявки"""
    serializer = OrderCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    
    # Создаем заявку
    order = Order.objects.create(
        user=request.user,
        delivery_address=data['delivery_address'],
        delivery_comment=data.get('delivery_comment', ''),
        contact_person=data.get('contact_person', ''),
        contact_phone=data.get('contact_phone', ''),
    )
    
    # Создаем позиции
    for item_data in data['items']:
        try:
            product = Product.objects.get(id=item_data['product_id'], is_active=True)
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                price=product.price
            )
        except Product.DoesNotExist:
            order.delete()
            return Response(
                {'detail': f'Товар с ID {item_data["product_id"]} не найден'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    """Получить заявки пользователя"""
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_tracking(request, order_id):
    """Получить информацию об отслеживании заявки"""
    try:
        order = Order.objects.get(id=order_id, user=request.user)
        return Response({
            'order_id': order.id,
            'status': order.status,
            'tracking_number': order.tracking_number,
            'estimated_delivery_date': order.estimated_delivery_date,
        })
    except Order.DoesNotExist:
        return Response(
            {'detail': 'Заявка не найдена'},
            status=status.HTTP_404_NOT_FOUND
        )

