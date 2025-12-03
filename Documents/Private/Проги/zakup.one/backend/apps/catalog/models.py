from django.db import models
from apps.suppliers.models import Supplier


class Category(models.Model):
    name = models.CharField(max_length=255, verbose_name='Название категории')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children', verbose_name='Родительская категория')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'

    def __str__(self):
        return self.name


class Product(models.Model):
    ORIGIN_CHOICES = [
        ('РФ', 'РФ'),
        ('Китай', 'Китай'),
        ('КР', 'КР'),
        ('РК', 'РК'),
    ]

    name = models.CharField(max_length=255, verbose_name='Название товара')
    article = models.CharField(max_length=100, db_index=True, verbose_name='Артикул')
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', verbose_name='Поставщик')
    unit = models.CharField(max_length=20, default='шт', verbose_name='Единица измерения')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', verbose_name='Категория')
    origin = models.CharField(max_length=20, choices=ORIGIN_CHOICES, default='РФ', verbose_name='Происхождение')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    is_recommended = models.BooleanField(default=False, verbose_name='Рекомендуемый')
    is_promotional = models.BooleanField(default=False, verbose_name='Акционный')
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Базовая цена')
    markup_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name='Наценка (%)')
    final_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Итоговая цена')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
        indexes = [
            models.Index(fields=['article']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f'{self.name} ({self.article})'

    def save(self, *args, **kwargs):
        # Автоматический пересчет итоговой цены
        if self.base_price and self.markup_percent:
            self.final_price = self.base_price * (1 + self.markup_percent / 100)
        elif self.base_price:
            self.final_price = self.base_price
        super().save(*args, **kwargs)


