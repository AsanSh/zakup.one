# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0011_add_tracking_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='deliverytracking',
            name='pickup_address',
            field=models.TextField(blank=True, null=True, verbose_name='Адрес погрузки'),
        ),
        migrations.AddField(
            model_name='deliverytracking',
            name='pickup_lat',
            field=models.FloatField(blank=True, null=True, verbose_name='Широта адреса погрузки'),
        ),
        migrations.AddField(
            model_name='deliverytracking',
            name='pickup_lng',
            field=models.FloatField(blank=True, null=True, verbose_name='Долгота адреса погрузки'),
        ),
    ]

