import secrets
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse


def generate_verification_token():
    """Генерация токена для подтверждения email"""
    return secrets.token_urlsafe(32)


def send_email_verification(user):
    """Отправка письма для подтверждения email"""
    token = generate_verification_token()
    user.email_verification_token = token
    user.save()
    
    verification_url = f"{settings.FRONTEND_URL or 'http://localhost:5173'}/verify-email?token={token}"
    
    subject = 'Подтверждение email - ZAKUP.ONE'
    message = f'''
Здравствуйте, {user.full_name or user.email}!

Для завершения регистрации на платформе ZAKUP.ONE, пожалуйста, подтвердите ваш email адрес, перейдя по ссылке:

{verification_url}

Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.

С уважением,
Команда ZAKUP.ONE
'''
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


def send_registration_submitted_email(user):
    """Отправка письма пользователю о том, что заявка отправлена администратору"""
    subject = 'Заявка на регистрацию отправлена - ZAKUP.ONE'
    message = f'''
Здравствуйте, {user.full_name or user.email}!

Ваша заявка на регистрацию успешно отправлена администратору для рассмотрения.

После одобрения вашей заявки вы получите уведомление и сможете войти в систему.

По всем вопросам обращайтесь по телефону: {settings.CONTACT_PHONE}

С уважением,
Команда ZAKUP.ONE
'''
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


def send_admin_notification_email(user):
    """Отправка уведомления администратору о новой заявке на регистрацию"""
    admin_emails = user.__class__.objects.filter(
        role='ADMIN',
        is_active=True,
        email_verified=True
    ).values_list('email', flat=True)
    
    if not admin_emails:
        return
    
    subject = f'Новая заявка на регистрацию - {user.email}'
    message = f'''
Новая заявка на регистрацию:

Email: {user.email}
Имя: {user.full_name or 'Не указано'}
Компания: {user.company.name if user.company else 'Не указана'}

Пожалуйста, рассмотрите заявку в админ-панели.
'''
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        list(admin_emails),
        fail_silently=False,
    )

