"""
Serializers для заявок
"""
from rest_framework import serializers
from orders.models import Order, OrderItem
from products.models import Product


class OrderItemCreateSerializer(serializers.Serializer):
    """Serializer для создания позиции заявки"""
    product_id = serializers.IntegerField()
    quantity = serializers.FloatField()


class OrderCreateSerializer(serializers.Serializer):
    """Serializer для создания заявки"""
    items = OrderItemCreateSerializer(many=True)
    delivery_address = serializers.CharField()
    delivery_comment = serializers.CharField(required=False, allow_blank=True)
    delivery_date = serializers.DateTimeField(required=False, allow_null=True)
    contact_person = serializers.CharField(required=False, allow_blank=True)
    contact_phone = serializers.CharField(required=False, allow_blank=True)
    
    def create(self, validated_data):
        user = validated_data.pop('user')
        items_data = validated_data.pop('items')
        
        order = Order.objects.create(user=user, **validated_data)
        
        # Создаем позиции заявки
        for item_data in items_data:
            try:
                product = Product.objects.get(id=item_data['product_id'])
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item_data['quantity'],
                    price=product.price
                )
            except Product.DoesNotExist:
                pass
        
        return order


class OrderSerializer(serializers.ModelSerializer):
    """Serializer для заявки"""
    
    class Meta:
        model = Order
        fields = [
            'id', 'status', 'delivery_address', 'tracking_number',
            'estimated_delivery_date', 'created_at'
        ]

