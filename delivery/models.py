"""
Модели для отслеживания доставки для Django
"""
from django.db import models
from orders.models import Order


class DeliveryStatus(models.TextChoices):
    """Статусы доставки"""
    PENDING = 'pending', 'Ожидает отправки'
    SHIPPED = 'shipped', 'Отправлена'
    IN_TRANSIT = 'in_transit', 'В пути'
    OUT_FOR_DELIVERY = 'out_for_delivery', 'В доставке'
    DELIVERED = 'delivered', 'Доставлена'
    FAILED = 'failed', 'Не удалось доставить'


class DeliveryTracking(models.Model):
    """Модель отслеживания доставки"""
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery_tracking')
    
    # Информация о доставке
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    carrier = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=DeliveryStatus.choices,
        default=DeliveryStatus.PENDING,
        db_index=True
    )
    
    # Водитель
    driver = models.ForeignKey('drivers.Driver', on_delete=models.SET_NULL, blank=True, null=True, related_name='deliveries')
    
    # Даты
    shipped_at = models.DateTimeField(blank=True, null=True)
    estimated_delivery_date = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    
    # Локация
    current_location = models.CharField(max_length=500, blank=True, null=True)
    destination = models.CharField(max_length=500, blank=True, null=True)
    
    # Геолокация водителя
    driver_latitude = models.CharField(max_length=50, blank=True, null=True)
    driver_longitude = models.CharField(max_length=50, blank=True, null=True)
    driver_location_updated_at = models.DateTimeField(blank=True, null=True)
    
    # Информация о приемке
    accepted_by = models.CharField(max_length=255, blank=True, null=True)
    accepted_at = models.DateTimeField(blank=True, null=True)
    
    # Комментарии
    notes = models.TextField(blank=True, null=True)
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'delivery_tracking'
        verbose_name = 'Отслеживание доставки'
        verbose_name_plural = 'Отслеживания доставок'
    
    def __str__(self):
        return f"Доставка заявки #{self.order.id}"


class DeliveryEvent(models.Model):
    """События отслеживания доставки"""
    tracking = models.ForeignKey(DeliveryTracking, on_delete=models.CASCADE, related_name='events')
    
    # Информация о событии
    status = models.CharField(max_length=20, choices=DeliveryStatus.choices)
    location = models.CharField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # Метаданные
    occurred_at = models.DateTimeField(auto_now_add=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'delivery_events'
        verbose_name = 'Событие доставки'
        verbose_name_plural = 'События доставок'
        ordering = ['-occurred_at']
    
    def __str__(self):
        return f"{self.get_status_display()} - {self.occurred_at}"

