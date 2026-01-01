from django.db import models
from django.db.models import Max
from django.utils import timezone
from datetime import datetime
from apps.users.models import User, Company
from apps.catalog.models import Product


def get_user_company_model():
    """Получить модель UserCompany для избежания циклических импортов"""
    from apps.users.models import UserCompany
    return UserCompany


class Order(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'Новая'),
        ('PAID', 'Оплачена'),
        ('IN_PROGRESS', 'В обработке'),
        ('COLLECTED', 'Собрана'),
        ('IN_DELIVERY', 'В доставке'),
        ('DELIVERED', 'Доставлена'),
        ('PROBLEMATIC', 'Проблемная'),
        ('CANCELLED', 'Отменена'),
        ('DEBT', 'Долг'),
    ]

    PAYMENT_TYPE_CHOICES = [
        ('without_invoice', 'Без счёта'),
        ('with_invoice', 'Со счётом'),
    ]

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', verbose_name='Клиент')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders', verbose_name='Компания')
    user_company_id = models.IntegerField(null=True, blank=True, verbose_name='ID компании пользователя')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW', verbose_name='Статус')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='without_invoice', verbose_name='Способ оплаты')
    installment = models.BooleanField(default=False, verbose_name='Оформлено в рассрочку')
    
    # Контакты получателя
    recipient_name = models.CharField(max_length=255, verbose_name='Имя получателя')
    recipient_phone = models.CharField(max_length=20, verbose_name='Телефон получателя')
    delivery_address = models.TextField(verbose_name='Адрес доставки')
    
    # Реквизиты компании (если со счетом)
    company_name = models.CharField(max_length=255, blank=True, null=True, verbose_name='Название юр.лица')
    company_inn = models.CharField(max_length=20, blank=True, null=True, verbose_name='БИН/ИНН')
    company_bank = models.CharField(max_length=255, blank=True, null=True, verbose_name='Банк')
    company_account = models.CharField(max_length=50, blank=True, null=True, verbose_name='Номер расчётного счёта')
    company_legal_address = models.TextField(blank=True, null=True, verbose_name='Юридический адрес')
    
    delivery_date = models.DateField(null=True, blank=True, verbose_name='Желаемая дата доставки')
    comment = models.TextField(blank=True, verbose_name='Комментарий')
    order_number = models.CharField(max_length=20, unique=True, null=True, blank=True, verbose_name='Номер заявки')
    invoice_number = models.CharField(max_length=50, blank=True, null=True, verbose_name='Номер счёта')
    invoice_pdf = models.FileField(upload_to='invoices/', blank=True, null=True, verbose_name='PDF счёта')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        old_status = None
        if self.pk:
            try:
                old_order = Order.objects.get(pk=self.pk)
                old_status = old_order.status
            except Order.DoesNotExist:
                pass
        
        if not self.order_number:
            # Генерируем номер заявки в формате O031225-1
            today = datetime.now()
            date_str = today.strftime('%d%m%y')  # ДДММГГ
            
            # Находим максимальный номер заявки за сегодня
            today_orders = Order.objects.filter(
                created_at__date=today.date(),
                order_number__startswith=f'O{date_str}-'
            )
            
            if today_orders.exists():
                # Извлекаем номера и находим максимальный
                max_num = 0
                for order in today_orders:
                    try:
                        num_part = int(order.order_number.split('-')[1])
                        max_num = max(max_num, num_part)
                    except (ValueError, IndexError):
                        pass
                order_num = max_num + 1
            else:
                order_num = 1
            
            self.order_number = f'O{date_str}-{order_num}'
        
        super().save(*args, **kwargs)
        
        # Трекинг создается только при наличии активной подписки Стандарт или VIP
        # Не зависит от оплаты заказа
        # Создание трекинга происходит в DeliveryTrackingViewSet при первом запросе

    def __str__(self):
        return f'Заявка {self.order_number or self.id} от {self.client.email}'

    @property
    def total_amount(self):
        return sum(item.total_price for item in self.items.all())

    @property
    def user_company(self):
        """Получить компанию пользователя"""
        if self.user_company_id:
            try:
                UserCompany = get_user_company_model()
                return UserCompany.objects.get(id=self.user_company_id)
            except:
                return None
        return None

    def _create_tracking_if_available(self):
        """Создать трекинг если доступен по тарифу"""
        from apps.users.models import UserSubscription
        try:
            subscription = UserSubscription.objects.filter(
                user=self.client,
                status='ACTIVE'
            ).select_related('plan').first()
            
            if (subscription and subscription.is_active and 
                subscription.plan.delivery_tracking_available):
                DeliveryTracking.objects.get_or_create(
                    order=self,
                    defaults={
                        'status': 'ACCEPTED',
                        'items_count': self.items.count()
                    }
                )
        except Exception:
            pass

    def mark_as_delivered(self):
        """Отметить заказ как доставленный и увеличить счетчик заказов компании"""
        if self.status != 'DELIVERED':
            self.status = 'DELIVERED'
            self.save()
            
            # Увеличиваем счетчик заказов компании
            if self.user_company_id:
                try:
                    UserCompany = get_user_company_model()
                    user_company = UserCompany.objects.get(id=self.user_company_id)
                    user_company.increment_orders()
                except:
                    pass


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name='Заявка')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='order_items', verbose_name='Товар')
    quantity = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Количество')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Цена на момент заявки')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Итоговая цена')

    class Meta:
        verbose_name = 'Позиция заявки'
        verbose_name_plural = 'Позиции заявок'

    def __str__(self):
        return f'{self.product.name} x {self.quantity}'

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.price
        super().save(*args, **kwargs)


class Invoice(models.Model):
    """Счета на оплату"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='invoices', verbose_name='Заявка')
    invoice_number = models.CharField(max_length=50, unique=True, verbose_name='Номер счета')
    pdf_file = models.FileField(upload_to='invoices/pdf/', blank=True, null=True, verbose_name='PDF файл')
    excel_file = models.FileField(upload_to='invoices/excel/', blank=True, null=True, verbose_name='Excel файл')
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name='Отправлено')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')

    class Meta:
        verbose_name = 'Счет'
        verbose_name_plural = 'Счета'
        ordering = ['-created_at']

    def __str__(self):
        return f"Счет {self.invoice_number} для заявки {self.order.order_number}"


class DeliveryTracking(models.Model):
    """Трекинг доставки заказа"""
    # Обязательные статусы доставки (единый источник правды)
    STATUS_CHOICES = [
        ('WAITING_FOR_DRIVER', 'Ожидание водителя'),
        ('DRIVER_ASSIGNED', 'Водитель назначен'),
        ('WAITING_FOR_LOADING', 'Ожидает погрузки'),
        ('ON_THE_WAY_TO_PICKUP', 'Едет к складу'),
        ('ARRIVED_AT_PICKUP', 'Прибыл на склад'),
        ('LOADED', 'Загружен'),
        ('ON_THE_WAY_TO_DESTINATION', 'В пути к получателю'),
        ('DELIVERED_PENDING_CONFIRM', 'Доставлен (ожидает подтверждения)'),
        ('COMPLETED', 'Завершён'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='tracking', verbose_name='Заявка')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='WAITING_FOR_DRIVER', verbose_name='Статус')
    
    # Информация о водителе
    driver_name = models.CharField(max_length=255, null=True, blank=True, verbose_name='Имя водителя')
    driver_phone = models.CharField(max_length=20, null=True, blank=True, verbose_name='Телефон водителя')
    vehicle_number = models.CharField(max_length=20, null=True, blank=True, verbose_name='Номер автомобиля')
    
    # Геолокация
    current_lat = models.FloatField(null=True, blank=True, verbose_name='Текущая широта')
    current_lng = models.FloatField(null=True, blank=True, verbose_name='Текущая долгота')
    
    # Адрес погрузки
    pickup_address = models.TextField(null=True, blank=True, verbose_name='Адрес погрузки')
    pickup_lat = models.FloatField(null=True, blank=True, verbose_name='Широта адреса погрузки')
    pickup_lng = models.FloatField(null=True, blank=True, verbose_name='Долгота адреса погрузки')
    
    # ETA
    eta_minutes = models.IntegerField(null=True, blank=True, verbose_name='ETA (минуты)')
    
    # Активность трекинга
    is_active = models.BooleanField(default=False, verbose_name='Трекинг активен')
    
    # Дополнительная информация
    weight = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Вес (кг)')
    volume = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Объем (м³)')
    items_count = models.IntegerField(default=0, verbose_name='Количество позиций')
    
    # История статусов
    status_history = models.JSONField(default=list, verbose_name='История статусов')
    
    # Фото
    loading_photo = models.ImageField(upload_to='tracking/loading/', null=True, blank=True, verbose_name='Фото загрузки')
    unloading_photo = models.ImageField(upload_to='tracking/unloading/', null=True, blank=True, verbose_name='Фото выгрузки')
    confirmation_photo = models.ImageField(upload_to='tracking/confirmation/', null=True, blank=True, verbose_name='Фото подтверждения')
    
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')

    class Meta:
        verbose_name = 'Трекинг доставки'
        verbose_name_plural = 'Трекинг доставок'
        ordering = ['-updated_at']

    def __str__(self):
        return f"Трекинг заявки {self.order.order_number}"

    def update_status(self, new_status, operator=None, driver_name=None, lat=None, lng=None, eta_minutes=None):
        """Обновить статус и сохранить в историю"""
        old_status = self.status
        self.status = new_status
        
        # Обновляем геолокацию и ETA если переданы
        if lat is not None:
            self.current_lat = lat
        if lng is not None:
            self.current_lng = lng
        if eta_minutes is not None:
            self.eta_minutes = eta_minutes
        if driver_name:
            self.driver_name = driver_name
        
        # Сохраняем в историю
        self.status_history.append({
            'status': new_status,
            'old_status': old_status,
            'timestamp': timezone.now().isoformat(),
            'operator': operator.email if operator else None,
            'driver_name': driver_name,
            'lat': lat,
            'lng': lng,
            'eta_minutes': eta_minutes
        })
        self.save()
    
    def calculate_is_active(self):
        """Вычислить is_active на основе оплаты заказа и подписки"""
        # Проверяем оплату заказа
        is_paid = self.order.status in ['PAID', 'IN_PROGRESS', 'COLLECTED', 'IN_DELIVERY', 'DELIVERED']
        
        # Проверяем подписку пользователя
        try:
            from apps.users.models import UserSubscription
            subscription = UserSubscription.objects.filter(
                user=self.order.client,
                status='ACTIVE'
            ).select_related('plan').first()
            
            has_tracking = subscription and subscription.is_active and subscription.plan.delivery_tracking_available
        except:
            has_tracking = False
        
        return is_paid and has_tracking
    
    def save(self, *args, **kwargs):
        # Автоматически вычисляем is_active при сохранении
        self.is_active = self.calculate_is_active()
        super().save(*args, **kwargs)



