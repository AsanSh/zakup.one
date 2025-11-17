"""
Serializers для заявок
"""
from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.serializers import ProductSerializer


class OrderItemCreateSerializer(serializers.Serializer):
    """Сериализатор для создания позиции заявки"""
    product_id = serializers.IntegerField()
    quantity = serializers.FloatField()


class OrderItemSerializer(serializers.ModelSerializer):
    """Сериализатор позиции заявки"""
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']


class OrderCreateSerializer(serializers.Serializer):
    """Сериализатор для создания заявки"""
    items = OrderItemCreateSerializer(many=True)
    delivery_address = serializers.CharField()
    delivery_comment = serializers.CharField(required=False, allow_blank=True)
    contact_person = serializers.CharField(required=False, allow_blank=True)
    contact_phone = serializers.CharField(required=False, allow_blank=True)


class OrderSerializer(serializers.ModelSerializer):
    """Сериализатор заявки"""
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user_email', 'delivery_address', 'delivery_comment',
                  'delivery_date', 'estimated_delivery_date', 'tracking_number',
                  'contact_person', 'contact_phone', 'status', 'items',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

