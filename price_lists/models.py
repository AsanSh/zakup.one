"""
Модели для автоматического обновления прайс-листов для Django
"""
from django.db import models
from products.models import Supplier


class UpdateFrequency(models.TextChoices):
    """Частота обновления прайс-листа"""
    DAILY = 'daily', 'Ежедневно'
    WEEKLY = 'weekly', 'Еженедельно'
    MONTHLY = 'monthly', 'Ежемесячно'
    MANUAL = 'manual', 'Вручную'


class PriceListUpdate(models.Model):
    """Модель для автоматического обновления прайс-листов"""
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='price_list_updates')
    
    # URL для скачивания прайс-листа
    download_url = models.URLField()
    
    # Путь к сохраненному файлу
    file_path = models.CharField(max_length=500, blank=True, null=True)
    
    # Частота обновления
    frequency = models.CharField(
        max_length=20,
        choices=UpdateFrequency.choices,
        default=UpdateFrequency.MANUAL
    )
    
    # Параметры парсинга
    header_row = models.IntegerField(default=7)
    start_row = models.IntegerField(default=8)
    
    # Статус
    is_active = models.BooleanField(default=True)
    last_update = models.DateTimeField(blank=True, null=True)
    next_update = models.DateTimeField(blank=True, null=True)
    
    # Результаты последнего обновления
    last_imported_count = models.IntegerField(default=0)
    last_updated_count = models.IntegerField(default=0)
    last_error = models.TextField(blank=True, null=True)
    
    # Метаданные
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'price_list_updates'
        verbose_name = 'Обновление прайс-листа'
        verbose_name_plural = 'Обновления прайс-листов'
    
    def __str__(self):
        return f"{self.supplier.name} - {self.get_frequency_display()}"

