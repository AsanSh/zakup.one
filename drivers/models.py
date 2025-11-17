"""
Модели для работы с водителями для Django
"""
from django.db import models


class Driver(models.Model):
    """Модель водителя"""
    # Основная информация
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50, unique=True, db_index=True)
    telegram_id = models.CharField(max_length=100, unique=True, db_index=True, blank=True, null=True)
    
    # Геолокация
    current_latitude = models.FloatField(blank=True, null=True)
    current_longitude = models.FloatField(blank=True, null=True)
    location_updated_at = models.DateTimeField(blank=True, null=True)
    
    # Статус
    is_active = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'drivers'
        verbose_name = 'Водитель'
        verbose_name_plural = 'Водители'
    
    def __str__(self):
        return self.full_name

