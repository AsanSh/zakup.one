from rest_framework import serializers
from .models import Order, OrderItem
from apps.catalog.serializers import ProductSerializer
from apps.users.serializers import UserSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()
    client = UserSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'client', 'company', 'status', 'delivery_address', 'delivery_date', 
                  'comment', 'created_at', 'updated_at', 'items', 'total_amount']
    
    def get_total_amount(self, obj):
        return float(obj.total_amount)


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True)

    class Meta:
        model = Order
        fields = ['delivery_address', 'delivery_date', 'comment', 'items']

    def create(self, validated_data):
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            items_data = validated_data.pop('items', [])
            logger.info(f'Received items_data: {items_data}, type: {type(items_data)}')
            
            # Получаем пользователя из контекста
            request = self.context.get('request')
            if not request:
                logger.error('Request context is missing')
                raise serializers.ValidationError('Request context is missing')
            
            user = request.user
            if not user or not user.is_authenticated:
                logger.error(f'User not authenticated: {user}')
                raise serializers.ValidationError('User not authenticated')
            
            company = getattr(user, 'company', None) if hasattr(user, 'company') else None
            
            logger.info(f'Creating order for user: {user.email} (ID: {user.id}), company: {company}')
            logger.info(f'Items data: {items_data}, count: {len(items_data)}')
            
            # Проверяем, что есть товары
            if not items_data or len(items_data) == 0:
                logger.error('No items in order')
                raise serializers.ValidationError('Заявка должна содержать хотя бы один товар')
            
            # client и company будут установлены в perform_create, но на всякий случай устанавливаем здесь тоже
            order = Order.objects.create(
                client=user,
                company=company,
                **validated_data
            )
            
            logger.info(f'Order created: ID={order.id}, order_number={order.order_number}, client={order.client.email}')
            
            created_items = 0
            for idx, item_data in enumerate(items_data):
                from apps.catalog.models import Product
                try:
                    logger.info(f'Processing item {idx + 1}/{len(items_data)}: {item_data}')
                    product_id = item_data.get('product_id')
                    if not product_id:
                        logger.error(f'Item {idx + 1} missing product_id: {item_data}')
                        continue
                    
                    product = Product.objects.get(pk=product_id)
                    quantity = item_data.get('quantity', 1)
                    
                    logger.info(f'Creating OrderItem: product_id={product_id}, quantity={quantity}, price={product.final_price}')
                    
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=quantity,
                        price=product.final_price
                    )
                    created_items += 1
                    logger.info(f'OrderItem created: {product.name} x {quantity}')
                except Product.DoesNotExist:
                    logger.error(f'Product not found: product_id={item_data.get("product_id")}')
                    continue
                except Exception as e:
                    logger.error(f'Error creating OrderItem {idx + 1}: {str(e)}', exc_info=True)
                    continue
            
            if created_items == 0:
                logger.error(f'No items created for order {order.id}, deleting order')
                order.delete()
                raise serializers.ValidationError('Не удалось создать товары в заявке. Проверьте, что товары существуют.')
            
            logger.info(f'Order {order.id} created successfully with {created_items} items')
            return order
        except serializers.ValidationError:
            raise
        except Exception as e:
            logger.error(f'Unexpected error in OrderCreateSerializer.create: {str(e)}', exc_info=True)
            raise serializers.ValidationError(f'Ошибка при создании заявки: {str(e)}')


class OrderItemUpdateSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False, allow_null=True)  # Если None - новый товар
    product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)


class OrderUpdateSerializer(serializers.ModelSerializer):
    items = OrderItemUpdateSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = ['status', 'delivery_address', 'delivery_date', 'comment', 'items']

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Обновляем основные поля заявки
        instance.status = validated_data.get('status', instance.status)
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


