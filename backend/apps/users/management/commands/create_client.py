from django.core.management.base import BaseCommand
from apps.users.models import User


class Command(BaseCommand):
    help = 'Создает клиентского пользователя'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Email пользователя', default='client@zakup.one')
        parser.add_argument('--password', type=str, help='Пароль', default='client123')
        parser.add_argument('--full-name', type=str, help='Полное имя', default='Клиент')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        full_name = options['full_name']

        # Проверяем, существует ли пользователь
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Пользователь с email {email} уже существует'))
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Пароль обновлен для пользователя {email}'))
        else:
            # Создаем нового пользователя с ролью CLIENT
            user = User.objects.create_user(
                email=email,
                password=password,
                full_name=full_name,
                role='CLIENT',
                is_active=True
            )
            self.stdout.write(self.style.SUCCESS(f'Клиентский пользователь создан: {email}'))

        self.stdout.write(self.style.SUCCESS(f'\nДанные для входа:'))
        self.stdout.write(self.style.SUCCESS(f'Email: {email}'))
        self.stdout.write(self.style.SUCCESS(f'Пароль: {password}'))
        self.stdout.write(self.style.SUCCESS(f'Роль: {user.role}'))


