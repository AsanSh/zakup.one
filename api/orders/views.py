"""
API views для заявок
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from orders.models import Order, OrderItem, OrderStatus
from products.models import Product
from delivery.models import DeliveryTracking, DeliveryEvent
from .serializers import OrderSerializer, OrderCreateSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    """
    GET: Получить список заявок текущего пользователя
    POST: Создать новую заявку
    """
    if request.method == 'GET':
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    else:  # POST
        serializer = OrderCreateSerializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save(user=request.user)
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """
    Создать новую заявку
    POST /api/v1/orders/
    """
    serializer = OrderCreateSerializer(data=request.data)
    if serializer.is_valid():
        order = serializer.save(user=request.user)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_tracking(request, order_id):
    """
    Получить информацию об отслеживании доставки заказа
    GET /api/v1/orders/{order_id}/tracking
    """
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Заказ не найден'}, status=404)
    
    # Проверяем, что заказ принадлежит текущему пользователю
    if order.user != request.user and not request.user.is_admin:
        return Response({'error': 'Доступ запрещен'}, status=403)
    
    try:
        tracking = DeliveryTracking.objects.get(order=order)
        events = DeliveryEvent.objects.filter(tracking=tracking).order_by('-occurred_at')
        
        return Response({
            'order_id': order_id,
            'status': tracking.status,
            'tracking_number': tracking.tracking_number or '',
            'carrier': tracking.carrier or '',
            'current_location': tracking.current_location or '',
            'destination': tracking.destination or '',
            'estimated_delivery_date': tracking.estimated_delivery_date.isoformat() if tracking.estimated_delivery_date else None,
            'shipped_at': tracking.shipped_at.isoformat() if tracking.shipped_at else None,
            'delivered_at': tracking.delivered_at.isoformat() if tracking.delivered_at else None,
            'events': [
                {
                    'id': event.id,
                    'status': event.status,
                    'location': event.location or '',
                    'description': event.description or '',
                    'occurred_at': event.occurred_at.isoformat() if event.occurred_at else None,
                }
                for event in events
            ]
        })
    except DeliveryTracking.DoesNotExist:
        return Response({
            'order_id': order_id,
            'status': 'pending',
            'tracking_number': order.tracking_number or '',
            'estimated_delivery_date': order.estimated_delivery_date.isoformat() if order.estimated_delivery_date else None,
            'events': []
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_active_deliveries(request):
    """
    Получить активные доставки
    GET /api/v1/orders/active-deliveries
    """
    active_statuses = [
        OrderStatus.SHIPPED,
        OrderStatus.IN_TRANSIT,
        OrderStatus.DELIVERED
    ]
    
    orders = Order.objects.filter(
        user=request.user,
        status__in=active_statuses
    ).order_by('-created_at')
    
    result = []
    for order in orders:
        order_data = {
            'id': order.id,
            'status': order.status,
            'delivery_address': order.delivery_address,
            'delivery_comment': order.delivery_comment or '',
            'delivery_date': order.delivery_date.isoformat() if order.delivery_date else None,
            'contact_person': order.contact_person or '',
            'contact_phone': order.contact_phone or '',
            'tracking_number': order.tracking_number or '',
            'estimated_delivery_date': order.estimated_delivery_date.isoformat() if order.estimated_delivery_date else None,
            'created_at': order.created_at.isoformat() if order.created_at else None,
        }
        
        try:
            tracking = DeliveryTracking.objects.get(order=order)
            events = DeliveryEvent.objects.filter(tracking=tracking).order_by('-occurred_at')
            
            order_data['tracking'] = {
                'id': tracking.id,
                'order_id': tracking.order.id,
                'status': tracking.status,
                'tracking_number': tracking.tracking_number or '',
                'carrier': tracking.carrier or '',
                'current_location': tracking.current_location or '',
                'destination': tracking.destination or '',
                'estimated_delivery_date': tracking.estimated_delivery_date.isoformat() if tracking.estimated_delivery_date else None,
                'shipped_at': tracking.shipped_at.isoformat() if tracking.shipped_at else None,
                'delivered_at': tracking.delivered_at.isoformat() if tracking.delivered_at else None,
                'events': [
                    {
                        'id': event.id,
                        'status': event.status,
                        'location': event.location or '',
                        'description': event.description or '',
                        'occurred_at': event.occurred_at.isoformat() if event.occurred_at else None,
                    }
                    for event in events
                ]
            }
            
            if tracking.driver_latitude and tracking.driver_longitude:
                order_data['driver_location'] = {
                    'latitude': float(tracking.driver_latitude),
                    'longitude': float(tracking.driver_longitude),
                    'last_updated': tracking.driver_location_updated_at.isoformat() if tracking.driver_location_updated_at else None,
                }
        except DeliveryTracking.DoesNotExist:
            pass
        
        result.append(order_data)
    
    return Response(result)

