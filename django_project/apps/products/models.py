"""
Модели товаров и поставщиков для Django
"""
from django.db import models
from django.utils import timezone


class Supplier(models.Model):
    """Модель поставщика"""
    name = models.CharField(max_length=255, unique=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    # Параметры парсинга по умолчанию
    default_header_row = models.IntegerField(default=7)
    default_start_row = models.IntegerField(default=8)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'suppliers'
        verbose_name = 'Поставщик'
        verbose_name_plural = 'Поставщики'
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """Модель товара"""
    name = models.CharField(max_length=255, db_index=True)
    article = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    unit = models.CharField(max_length=20, blank=True, null=True)
    purchase_price = models.FloatField()  # Закупочная цена
    markup = models.FloatField(default=0.0)  # Надбавка
    price = models.FloatField()  # Продажная цена
    category = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='products')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
        indexes = [
            models.Index(fields=['name', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.article})"

