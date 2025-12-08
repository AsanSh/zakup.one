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


