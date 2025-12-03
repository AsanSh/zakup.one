from rest_framework import serializers
from .models import Order, OrderItem
from apps.catalog.serializers import ProductSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'client', 'company', 'status', 'delivery_address', 'delivery_date', 
                  'comment', 'created_at', 'updated_at', 'items', 'total_amount']
    
    def get_total_amount(self, obj):
        return float(obj.total_amount)


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True)

    class Meta:
        model = Order
        fields = ['delivery_address', 'delivery_date', 'comment', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            from apps.catalog.models import Product
            product = Product.objects.get(pk=item_data['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                price=product.final_price
            )
        
        return order


class OrderItemUpdateSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False, allow_null=True)  # Если None - новый товар
    product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)


class OrderUpdateSerializer(serializers.ModelSerializer):
    items = OrderItemUpdateSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = ['delivery_address', 'delivery_date', 'comment', 'items']

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Обновляем основные поля заявки
        instance.delivery_address = validated_data.get('delivery_address', instance.delivery_address)
        instance.delivery_date = validated_data.get('delivery_date', instance.delivery_date)
        instance.comment = validated_data.get('comment', instance.comment)
        instance.save()
        
        # Обновляем товары, если они переданы
        if items_data is not None and len(items_data) > 0:
            # Получаем ID существующих товаров
            existing_item_ids = {item['id'] for item in items_data if item.get('id')}
            
            # Удаляем товары, которых нет в новом списке
            instance.items.exclude(id__in=existing_item_ids).delete()
            
            # Обновляем или создаем товары
            for item_data in items_data:
                from apps.catalog.models import Product
                product = Product.objects.get(pk=item_data['product_id'])
                
                if item_data.get('id'):
                    # Обновляем существующий товар
                    try:
                        order_item = OrderItem.objects.get(id=item_data['id'], order=instance)
                        order_item.product = product
                        order_item.quantity = item_data['quantity']
                        order_item.price = product.final_price
                        order_item.save()
                    except OrderItem.DoesNotExist:
                        # Если товар не найден, создаем новый
                        OrderItem.objects.create(
                            order=instance,
                            product=product,
                            quantity=item_data['quantity'],
                            price=product.final_price
                        )
                else:
                    # Создаем новый товар
                    OrderItem.objects.create(
                        order=instance,
                        product=product,
                        quantity=item_data['quantity'],
                        price=product.final_price
                    )
        
        return instance


