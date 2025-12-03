from django.db import models


class Supplier(models.Model):
    name = models.CharField(max_length=255, verbose_name='Название поставщика')
    internal_code = models.CharField(max_length=50, unique=True, verbose_name='Внутренний код')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Поставщик'
        verbose_name_plural = 'Поставщики'

    def __str__(self):
        return self.name


class PriceList(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'Новый'),
        ('PROCESSED', 'Обработан'),
        ('FAILED', 'Ошибка'),
    ]

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='price_lists', verbose_name='Поставщик')
    file = models.FileField(upload_to='pricelists/', verbose_name='Файл')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='Загружен')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW', verbose_name='Статус')
    log = models.TextField(blank=True, verbose_name='Лог обработки')

    class Meta:
        verbose_name = 'Прайс-лист'
        verbose_name_plural = 'Прайс-листы'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f'{self.supplier.name} - {self.uploaded_at.strftime("%Y-%m-%d")}'



