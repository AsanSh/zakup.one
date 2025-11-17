"""
Views для админ-панели
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from apps.products.models import Product, Supplier
from apps.orders.models import Order

User = get_user_model()


def is_admin(user):
    """Проверка что пользователь админ"""
    return user.is_authenticated and user.is_admin


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users(request):
    """Получить список пользователей (только для админов)"""
    if not is_admin(request.user):
        return Response(
            {'detail': 'Доступ запрещен'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    users = User.objects.all()
    from apps.users.serializers import UserSerializer
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_products(request):
    """Получить список товаров (только для админов)"""
    if not is_admin(request.user):
        return Response(
            {'detail': 'Доступ запрещен'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    products = Product.objects.all()
    from apps.products.serializers import ProductSerializer
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders_admin(request):
    """Получить список заявок (только для админов)"""
    if not is_admin(request.user):
        return Response(
            {'detail': 'Доступ запрещен'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    orders = Order.objects.all().order_by('-created_at')
    from apps.orders.serializers import OrderSerializer
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

