from django.db import models
from apps.users.models import User, Company
from apps.catalog.models import Product


class Order(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'Новая'),
        ('IN_PROGRESS', 'В обработке'),
        ('COLLECTED', 'Собрана'),
        ('DELIVERED', 'Доставлена'),
    ]

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', verbose_name='Клиент')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders', verbose_name='Компания')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW', verbose_name='Статус')
    delivery_address = models.TextField(blank=True, default='', verbose_name='Адрес доставки')
    delivery_date = models.DateField(null=True, blank=True, verbose_name='Желаемая дата доставки')
    comment = models.TextField(blank=True, verbose_name='Комментарий')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'
        ordering = ['-created_at']

    def __str__(self):
        return f'Заявка #{self.id} от {self.client.email}'

    @property
    def total_amount(self):
        return sum(item.total_price for item in self.items.all())


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



