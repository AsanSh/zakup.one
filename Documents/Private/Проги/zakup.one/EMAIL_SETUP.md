# Настройка отправки email писем

## Текущая ситуация

Сейчас используется `console.EmailBackend` - письма выводятся в логи Docker, но не отправляются реально.

## Варианты настройки

### Вариант 1: Gmail (рекомендуется)

1. Включите двухфакторную аутентификацию в вашем Google аккаунте
2. Перейдите на https://myaccount.google.com/apppasswords
3. Создайте пароль приложения для "Почта" и "Другое устройство"
4. Скопируйте 16-значный пароль приложения
5. Отредактируйте файл `infra/env/backend.env`:
   ```env
   EMAIL_HOST_USER=ваш-email@gmail.com
   EMAIL_HOST_PASSWORD=ваш-16-значный-пароль-приложения
   ```
6. Перезапустите backend: `docker compose restart backend`

### Вариант 2: Mailtrap (для тестирования)

1. Зарегистрируйтесь на https://mailtrap.io (бесплатно)
2. Создайте inbox
3. Скопируйте учетные данные SMTP
4. Отредактируйте файл `infra/env/backend.env`:
   ```env
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_HOST_USER=ваш-mailtrap-username
   EMAIL_HOST_PASSWORD=ваш-mailtrap-password
   ```
5. Перезапустите backend: `docker compose restart backend`

### Вариант 3: Yandex Mail

1. Включите доступ по протоколу IMAP в настройках Yandex
2. Используйте пароль приложения (не основной пароль)
3. Отредактируйте файл `infra/env/backend.env`:
   ```env
   EMAIL_HOST=smtp.yandex.ru
   EMAIL_PORT=465
   EMAIL_USE_TLS=False
   EMAIL_USE_SSL=True
   EMAIL_HOST_USER=ваш-email@yandex.ru
   EMAIL_HOST_PASSWORD=ваш-пароль-приложения
   ```
4. Перезапустите backend: `docker compose restart backend`

## Проверка работы

После настройки попробуйте зарегистрировать нового пользователя - письмо должно прийти на указанный email.

## Получение ссылки для подтверждения из базы данных

Если письмо не пришло, можно получить ссылку для подтверждения командой:

```bash
docker compose exec backend python manage.py get_verification_link email@example.com
```

