from django.core.management.base import BaseCommand
from apps.users.models import User
from django.conf import settings


class Command(BaseCommand):
    help = 'Получить ссылку для подтверждения email пользователя'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email пользователя')

    def handle(self, *args, **options):
        email = options['email']
        
        try:
            user = User.objects.get(email=email)
            
            if not user.email_verification_token:
                self.stdout.write(self.style.ERROR(f'У пользователя {email} нет токена подтверждения. Возможно, email уже подтвержден или токен был удален.'))
                return
            
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            verification_url = f"{frontend_url}/verify-email?token={user.email_verification_token}"
            
            self.stdout.write(self.style.SUCCESS(f'\nСсылка для подтверждения email пользователя {email}:'))
            self.stdout.write(self.style.SUCCESS(f'\n{verification_url}\n'))
            self.stdout.write(f'Статус подтверждения: {"Подтвержден" if user.email_verified else "Не подтвержден"}')
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Пользователь с email {email} не найден'))

