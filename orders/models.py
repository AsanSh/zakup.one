"""
Модели заявок для Django
"""
from django.db import models
from django.utils import timezone
from users.models import User
from products.models import Product


class OrderStatus(models.TextChoices):
    """Статусы заявки"""
    NEW = 'new', 'Новая'
    IN_PROGRESS = 'in_progress', 'В обработке'
    COLLECTED = 'collected', 'Собрана'
    SHIPPED = 'shipped', 'Отправлена'
    IN_TRANSIT = 'in_transit', 'В пути'
    DELIVERED = 'delivered', 'Доставлена'
    CANCELLED = 'cancelled', 'Отменена'


class Order(models.Model):
    """Модель заявки"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    
    # Информация о доставке
    delivery_address = models.CharField(max_length=500)
    delivery_comment = models.TextField(blank=True, null=True)
    delivery_date = models.DateTimeField(blank=True, null=True)
    estimated_delivery_date = models.DateTimeField(blank=True, null=True)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    contact_phone = models.CharField(max_length=50, blank=True, null=True)
    
    # Файлы
    attached_file = models.FileField(upload_to='orders/', blank=True, null=True)
    
    # Статус
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.NEW,
        db_index=True
    )
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orders'
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Заявка #{self.id} от {self.user.email}"


class OrderItem(models.Model):
    """Модель позиции в заявке"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='order_items')
    quantity = models.FloatField()
    price = models.FloatField()  # Цена на момент заказа
    
    class Meta:
        db_table = 'order_items'
        verbose_name = 'Позиция заявки'
        verbose_name_plural = 'Позиции заявок'
    
    def __str__(self):
        return f"{self.product.name} x{self.quantity}"

