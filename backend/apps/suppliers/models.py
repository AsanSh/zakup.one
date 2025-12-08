from django.db import models


class Supplier(models.Model):
    PARSING_METHOD_CHOICES = [
        ('EXCEL', 'Excel парсинг'),
        ('CSV', 'CSV парсинг'),
        ('PDF', 'PDF парсинг'),
        ('WEB_SCRAPING', 'Веб-скрапинг'),
        ('API', 'API интеграция'),
        ('MANUAL', 'Ручной ввод'),
    ]

    name = models.CharField(max_length=255, verbose_name='Название поставщика')
    internal_code = models.CharField(max_length=50, unique=True, verbose_name='Внутренний код')
    contact_person = models.CharField(max_length=255, blank=True, verbose_name='Контактное лицо')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')
    email = models.EmailField(blank=True, verbose_name='Email')
    address = models.TextField(blank=True, verbose_name='Адрес')
    website = models.URLField(blank=True, verbose_name='Веб-сайт')
    default_parsing_method = models.CharField(max_length=20, choices=PARSING_METHOD_CHOICES, default='EXCEL', verbose_name='Метод парсинга по умолчанию')
    parsing_config = models.JSONField(default=dict, blank=True, verbose_name='Конфигурация парсинга')
    markup_som = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Наценка (сом)')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Поставщик'
        verbose_name_plural = 'Поставщики'

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Сохраняем старое значение наценки для сравнения
        if self.pk:
            old_instance = Supplier.objects.get(pk=self.pk)
            old_markup = old_instance.markup_som
        else:
            old_markup = None
        
        super().save(*args, **kwargs)
        
        # Если наценка изменилась, пересчитываем цены всех товаров поставщика
        if old_markup is not None and old_markup != self.markup_som:
            from apps.catalog.models import Product
            products = Product.objects.filter(supplier=self)
            for product in products:
                product.final_price = product.base_price + float(self.markup_som or 0)
                product.save(update_fields=['final_price'])


class PriceList(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'Новый'),
        ('PROCESSING', 'Обрабатывается'),
        ('PROCESSED', 'Обработан'),
        ('FAILED', 'Ошибка'),
    ]

    PARSING_METHOD_CHOICES = [
        ('EXCEL', 'Excel парсинг'),
        ('CSV', 'CSV парсинг'),
        ('PDF', 'PDF парсинг'),
        ('WEB_SCRAPING', 'Веб-скрапинг'),
        ('API', 'API интеграция'),
        ('MANUAL', 'Ручной ввод'),
    ]

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='price_lists', verbose_name='Поставщик')
    file = models.FileField(upload_to='pricelists/', verbose_name='Файл')
    parsing_method = models.CharField(max_length=20, choices=PARSING_METHOD_CHOICES, null=True, blank=True, verbose_name='Метод парсинга')
    parsing_config = models.JSONField(default=dict, blank=True, verbose_name='Конфигурация парсинга')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='Загружен')
    processed_at = models.DateTimeField(null=True, blank=True, verbose_name='Обработан')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW', verbose_name='Статус')
    log = models.TextField(blank=True, verbose_name='Лог обработки')
    products_count = models.IntegerField(default=0, verbose_name='Количество товаров')

    class Meta:
        verbose_name = 'Прайс-лист'
        verbose_name_plural = 'Прайс-листы'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f'{self.supplier.name} - {self.uploaded_at.strftime("%Y-%m-%d")}'



