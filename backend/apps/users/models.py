from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class Company(models.Model):
    name = models.CharField(max_length=255, verbose_name='Название компании')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')
    email = models.EmailField(blank=True, verbose_name='Email')
    inn = models.CharField(max_length=12, blank=True, verbose_name='ИНН')
    address = models.TextField(blank=True, verbose_name='Адрес')
    contact_person = models.CharField(max_length=255, blank=True, verbose_name='Контактное лицо')
    approved = models.BooleanField(default=False, verbose_name='Одобрена')
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name='Дата одобрения')
    approved_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_companies', verbose_name='Одобрено пользователем')
    rejection_reason = models.TextField(blank=True, verbose_name='Причина отклонения')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Компания'
        verbose_name_plural = 'Компании'

    def __str__(self):
        return self.name


class User(AbstractUser):
    ROLE_CHOICES = [
        ('ADMIN', 'Администратор'),
        ('CLIENT', 'Клиент'),
    ]

    email = models.EmailField(unique=True, verbose_name='Email')
    full_name = models.CharField(max_length=255, blank=True, verbose_name='Полное имя')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='CLIENT', verbose_name='Роль')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='users', verbose_name='Компания')
    email_verified = models.BooleanField(default=False, verbose_name='Email подтвержден')
    email_verification_token = models.CharField(max_length=100, blank=True, null=True, verbose_name='Токен подтверждения email')
    username = None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return self.email


class SavedCompany(models.Model):
    """Сохраненные компании с реквизитами для формирования счетов"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_companies', verbose_name='Пользователь')
    name = models.CharField(max_length=255, verbose_name='Название компании')
    inn = models.CharField(max_length=20, verbose_name='ИНН')
    bank = models.CharField(max_length=255, verbose_name='Банк')
    account = models.CharField(max_length=50, verbose_name='Расчетный счет')
    legal_address = models.TextField(verbose_name='Юридический адрес')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')
    is_default = models.BooleanField(default=False, verbose_name='По умолчанию')

    class Meta:
        verbose_name = 'Сохраненная компания'
        verbose_name_plural = 'Сохраненные компании'
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.email})"


class SavedAddress(models.Model):
    """Сохраненные адреса доставки"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_addresses', verbose_name='Пользователь')
    address = models.TextField(verbose_name='Адрес доставки')
    label = models.CharField(max_length=100, blank=True, verbose_name='Название (например, "Офис", "Склад")')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')
    is_default = models.BooleanField(default=False, verbose_name='По умолчанию')

    class Meta:
        verbose_name = 'Сохраненный адрес'
        verbose_name_plural = 'Сохраненные адреса'
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.label or 'Адрес'} ({self.user.email})"


class SavedRecipient(models.Model):
    """Сохраненные получатели"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_recipients', verbose_name='Пользователь')
    name = models.CharField(max_length=255, verbose_name='Имя получателя')
    phone = models.CharField(max_length=20, verbose_name='Телефон')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')
    is_default = models.BooleanField(default=False, verbose_name='По умолчанию')

    class Meta:
        verbose_name = 'Сохраненный получатель'
        verbose_name_plural = 'Сохраненные получатели'
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.email})"


class SubscriptionPlan(models.Model):
    """Планы подписки"""
    PLAN_CHOICES = [
        ('BASIC', 'Базовый'),
        ('STANDARD', 'Стандарт'),
        ('VIP', 'VIP'),
    ]
    
    plan_type = models.CharField(max_length=20, choices=PLAN_CHOICES, unique=True, verbose_name='Тип плана')
    name = models.CharField(max_length=255, verbose_name='Название')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Цена (сом)')
    description = models.TextField(blank=True, verbose_name='Описание')
    max_companies = models.IntegerField(default=1, verbose_name='Максимум компаний')
    additional_company_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Цена за дополнительную компанию')
    delivery_count = models.IntegerField(default=0, verbose_name='Количество доставок (0 = неограниченно)')
    delivery_tracking_available = models.BooleanField(default=False, verbose_name='Доступен трекинг доставки')
    installment_available = models.BooleanField(default=False, verbose_name='Доступна рассрочка (после 5 заказов)')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'План подписки'
        verbose_name_plural = 'Планы подписки'
        ordering = ['price']

    def __str__(self):
        return self.name


class UserSubscription(models.Model):
    """Подписки пользователей"""
    STATUS_CHOICES = [
        ('ACTIVE', 'Активна'),
        ('EXPIRED', 'Истекла'),
        ('CANCELLED', 'Отменена'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions', verbose_name='Пользователь')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name='user_subscriptions', verbose_name='План')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE', verbose_name='Статус')
    start_date = models.DateTimeField(auto_now_add=True, verbose_name='Дата начала')
    end_date = models.DateTimeField(verbose_name='Дата окончания')
    companies_count = models.IntegerField(default=1, verbose_name='Количество компаний')
    delivery_count_used = models.IntegerField(default=0, verbose_name='Использовано доставок')
    installment_active = models.BooleanField(default=False, verbose_name='Активна рассрочка')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Подписка пользователя'
        verbose_name_plural = 'Подписки пользователей'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.plan.name}"

    @property
    def is_active(self):
        from django.utils import timezone
        return self.status == 'ACTIVE' and self.end_date > timezone.now()

    @property
    def can_add_company(self):
        return self.companies_count < self.plan.max_companies

    @property
    def has_delivery_available(self):
        if self.plan.delivery_count == 0:  # Неограниченно
            return True
        return self.delivery_count_used < self.plan.delivery_count


class UserCompany(models.Model):
    """Компании пользователя для оформления заказов"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_companies', verbose_name='Пользователь')
    name = models.CharField(max_length=255, verbose_name='Название компании')
    inn = models.CharField(max_length=20, verbose_name='ИНН')
    bank = models.CharField(max_length=255, verbose_name='Банк')
    account = models.CharField(max_length=50, verbose_name='Расчетный счет')
    legal_address = models.TextField(verbose_name='Юридический адрес')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')
    email = models.EmailField(blank=True, verbose_name='Email')
    orders_count = models.IntegerField(default=0, verbose_name='Количество заказов')
    installment_available = models.BooleanField(default=False, verbose_name='Доступна рассрочка')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')

    class Meta:
        verbose_name = 'Компания пользователя'
        verbose_name_plural = 'Компании пользователей'
        ordering = ['-created_at']
        unique_together = [['user', 'inn']]

    def __str__(self):
        return f"{self.name} ({self.user.email})"

    def increment_orders(self):
        """Увеличить счетчик заказов и проверить доступность рассрочки"""
        self.orders_count += 1
        # Для VIP тарифа: рассрочка доступна после 5 заказов
        if self.orders_count >= 5:
            self.installment_available = True
        self.save()


