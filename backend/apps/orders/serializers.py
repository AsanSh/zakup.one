from rest_framework import serializers
from .models import Order, OrderItem, Invoice, DeliveryTracking
from apps.catalog.serializers import ProductSerializer
from apps.users.models import SavedCompany
from django.core.files.base import ContentFile


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'quantity', 'price', 'total_price']
        read_only_fields = ['total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()
    client_email = serializers.EmailField(source='client.email', read_only=True)
    installment = serializers.BooleanField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'client', 'client_email', 'company',
            'recipient_name', 'recipient_phone', 'delivery_address', 'delivery_date',
            'comment', 'payment_type', 'company_name', 'company_inn', 'company_bank',
            'company_account', 'company_legal_address', 'invoice_number', 'invoice_pdf',
            'total_amount', 'items', 'installment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['order_number', 'created_at', 'updated_at', 'total_amount', 'installment']

    def get_total_amount(self, obj):
        try:
            return float(obj.total_amount)
        except (ValueError, TypeError, AttributeError):
            return 0.0


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True, write_only=True)
    recipient_name = serializers.CharField(required=False, allow_blank=True)
    recipient_phone = serializers.CharField(required=False, allow_blank=True)
    delivery_address = serializers.CharField(required=False, allow_blank=True)
    saved_company_id = serializers.IntegerField(required=False, allow_null=True)
    user_company_id = serializers.IntegerField(required=False, allow_null=True)
    installment = serializers.BooleanField(default=False, required=False)

    class Meta:
        model = Order
        fields = [
            'recipient_name', 'recipient_phone', 'delivery_address', 'delivery_date',
            'comment', 'payment_type', 'company_name', 'company_inn', 'company_bank',
            'company_account', 'company_legal_address', 'items', 'saved_company_id',
            'user_company_id', 'installment'
        ]

    def validate_installment(self, value):
        """Проверка доступности рассрочки"""
        if not value:
            return value
        
        request = self.context.get('request')
        user = request.user if request else None
        
        if not user:
            raise serializers.ValidationError('Пользователь не найден')
        
        user_company_id = self.initial_data.get('user_company_id')
        if not user_company_id:
            raise serializers.ValidationError('Необходимо указать компанию для рассрочки')
        
        # Проверяем подписку VIP
        from apps.users.models import UserSubscription
        try:
            subscription = UserSubscription.objects.filter(
                user=user,
                status='ACTIVE'
            ).select_related('plan').first()
            
            if not subscription or not subscription.is_active:
                raise serializers.ValidationError('У вас нет активной подписки')
            
            if subscription.plan.plan_type != 'VIP':
                raise serializers.ValidationError('Рассрочка доступна только для тарифа VIP')
            
            if not subscription.plan.installment_available:
                raise serializers.ValidationError('Рассрочка недоступна для вашего тарифа')
            
        except Exception as e:
            raise serializers.ValidationError(str(e))
        
        # Проверяем компанию
        from apps.users.models import UserCompany
        try:
            user_company = UserCompany.objects.get(id=user_company_id, user=user)
            if not user_company.installment_available:
                raise serializers.ValidationError(
                    'Рассрочка станет доступна после 5 успешно завершённых заказов от этой компании'
                )
        except UserCompany.DoesNotExist:
            raise serializers.ValidationError('Компания не найдена')
        
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        
        if not user:
            raise serializers.ValidationError('Пользователь не найден')

        items_data = validated_data.pop('items', [])
        saved_company_id = validated_data.pop('saved_company_id', None)
        user_company_id = validated_data.pop('user_company_id', None)
        installment = validated_data.pop('installment', False)

        # Используем компанию пользователя, если указана
        if user_company_id:
            from apps.users.models import UserCompany
            try:
                user_company = UserCompany.objects.get(id=user_company_id, user=user)
                validated_data['company_name'] = user_company.name
                validated_data['company_inn'] = user_company.inn
                validated_data['company_bank'] = user_company.bank
                validated_data['company_account'] = user_company.account
                validated_data['company_legal_address'] = user_company.legal_address
                validated_data['user_company_id'] = user_company_id
            except UserCompany.DoesNotExist:
                pass
        # Или используем сохраненную компанию
        elif saved_company_id:
            try:
                saved_company = SavedCompany.objects.get(id=saved_company_id, user=user)
                validated_data['company_name'] = saved_company.name
                validated_data['company_inn'] = saved_company.inn
                validated_data['company_bank'] = saved_company.bank
                validated_data['company_account'] = saved_company.account
                validated_data['company_legal_address'] = saved_company.legal_address
            except SavedCompany.DoesNotExist:
                pass

        validated_data['installment'] = installment

        # Устанавливаем значения по умолчанию, если не указаны
        if not validated_data.get('recipient_name'):
            validated_data['recipient_name'] = user.full_name or user.email
        if not validated_data.get('recipient_phone'):
            validated_data['recipient_phone'] = user.email
        if not validated_data.get('delivery_address'):
            validated_data['delivery_address'] = 'Не указан'

        # Создаем заявку
        order = Order.objects.create(
            client=user,
            company=user.company,
            **validated_data
        )

        # Создаем позиции заявки
        for item_data in items_data:
            from apps.catalog.models import Product
            try:
                product = Product.objects.get(id=item_data['product_id'])
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item_data['quantity'],
                    price=product.final_price
                )
            except Product.DoesNotExist:
                continue

        # Если заказ со счетом, генерируем счет
        if order.payment_type == 'with_invoice' and (order.company_name or order.user_company_id):
            from .utils import generate_invoice_pdf, generate_invoice_excel
            from django.utils import timezone
            
            # Генерируем номер счета
            invoice_number = f'INV-{order.order_number or order.id}'
            order.invoice_number = invoice_number
            
            # Генерируем PDF
            pdf_buffer = generate_invoice_pdf(order)
            pdf_filename = f'invoice_{invoice_number}.pdf'
            
            # Генерируем Excel
            excel_buffer = generate_invoice_excel(order)
            excel_filename = f'invoice_{invoice_number}.xlsx'
            
            # Создаем Invoice
            from .models import Invoice
            invoice = Invoice.objects.create(
                order=order,
                invoice_number=invoice_number
            )
            
            invoice.pdf_file.save(pdf_filename, ContentFile(pdf_buffer.read()), save=False)
            invoice.excel_file.save(excel_filename, ContentFile(excel_buffer.read()), save=False)
            invoice.sent_at = timezone.now()
            invoice.save()
            
            # TODO: Отправка на email пользователя
        
        # Трекинг будет создан автоматически при смене статуса на PAID (см. сигналы или метод mark_as_paid)

        return order


class OrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'status', 'recipient_name', 'recipient_phone', 'delivery_address',
            'delivery_date', 'comment', 'payment_type', 'company_name', 'company_inn',
            'company_bank', 'company_account', 'company_legal_address', 'invoice_number', 'installment'
        ]


class InvoiceSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)

    class Meta:
        model = Invoice
        fields = ['id', 'order', 'order_number', 'invoice_number', 'pdf_file', 'excel_file', 'sent_at', 'created_at']
        read_only_fields = ['invoice_number', 'sent_at', 'created_at']


class DeliveryTrackingSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    status_label = serializers.SerializerMethodField()
    locked = serializers.SerializerMethodField()
    reason = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryTracking
        fields = ['id', 'order', 'order_number', 'status', 'status_label', 'weight', 'volume',
                  'items_count', 'status_history', 'updated_at', 'created_at', 'locked', 'reason']
        read_only_fields = ['status_history', 'updated_at', 'created_at', 'locked', 'reason']

    def get_status_label(self, obj):
        if isinstance(obj, dict):
            return obj.get('status_label', '')
        return dict(DeliveryTracking.STATUS_CHOICES).get(obj.status, obj.status)
    
    def get_locked(self, obj):
        if isinstance(obj, dict):
            return obj.get('locked', False)
        # Locked состояние определяется подпиской, а не оплатой заказа
        return False
    
    def get_reason(self, obj):
        if isinstance(obj, dict):
            return obj.get('reason', '')
        # Причина блокировки определяется подпиской
        return None

