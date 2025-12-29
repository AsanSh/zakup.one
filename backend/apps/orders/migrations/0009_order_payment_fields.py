# Generated manually for order payment fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0007_alter_order_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='payment_type',
            field=models.CharField(choices=[('without_invoice', 'Без счёта'), ('with_invoice', 'Со счётом')], default='without_invoice', max_length=20, verbose_name='Способ оплаты'),
        ),
        migrations.AddField(
            model_name='order',
            name='recipient_name',
            field=models.CharField(default='', max_length=255, verbose_name='Имя получателя'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='order',
            name='recipient_phone',
            field=models.CharField(default='', max_length=20, verbose_name='Телефон получателя'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='order',
            name='company_name',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Название юр.лица'),
        ),
        migrations.AddField(
            model_name='order',
            name='company_inn',
            field=models.CharField(blank=True, max_length=20, null=True, verbose_name='БИН/ИНН'),
        ),
        migrations.AddField(
            model_name='order',
            name='company_bank',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Банк'),
        ),
        migrations.AddField(
            model_name='order',
            name='company_account',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='Номер расчётного счёта'),
        ),
        migrations.AddField(
            model_name='order',
            name='company_legal_address',
            field=models.TextField(blank=True, null=True, verbose_name='Юридический адрес'),
        ),
        migrations.AddField(
            model_name='order',
            name='invoice_number',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='Номер счёта'),
        ),
        migrations.AddField(
            model_name='order',
            name='invoice_pdf',
            field=models.FileField(blank=True, null=True, upload_to='invoices/', verbose_name='PDF счёта'),
        ),
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(choices=[('NEW', 'Новая'), ('PAID', 'Оплачена'), ('IN_PROGRESS', 'В обработке'), ('COLLECTED', 'Собрана'), ('IN_DELIVERY', 'В доставке'), ('DELIVERED', 'Доставлена'), ('PROBLEMATIC', 'Проблемная'), ('CANCELLED', 'Отменена'), ('DEBT', 'Долг')], default='NEW', max_length=20, verbose_name='Статус'),
        ),
        migrations.AlterField(
            model_name='order',
            name='delivery_address',
            field=models.TextField(verbose_name='Адрес доставки'),
        ),
    ]
