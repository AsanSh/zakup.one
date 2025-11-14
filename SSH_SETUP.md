# Настройка через SSH

## SSH доступ

У вас есть SSH ключ для доступа к серверу. Однако прямое SSH подключение может быть недоступно или требовать специальной настройки.

## Варианты выполнения команд

### Вариант 1: Через панель управления Spaceship

1. Зайдите в панель управления Spaceship
2. Найдите раздел "Terminal" или "SSH Access"
3. Выполните команды:

```bash
cd zakup.one
pip3 install -r requirements.txt
```

### Вариант 2: Через встроенный терминал

Многие хостинги предоставляют веб-терминал:
1. Зайдите в панель управления
2. Найдите "Web Terminal" или "Command Line"
3. Выполните установку зависимостей

### Вариант 3: Локальное SSH подключение

Если SSH доступен, используйте ключ:

```bash
ssh -i /path/to/key enopukaz@server41.shared.spaceship.host
cd zakup.one
pip3 install -r requirements.txt
```

## Команды для выполнения

После подключения выполните:

```bash
# Переход в директорию проекта
cd zakup.one

# Установка зависимостей
pip3 install -r requirements.txt

# Проверка установки
python3 -c "import fastapi; print('FastAPI установлен')"

# Настройка прав доступа
chmod 755 .
chmod 755 app
chmod 755 frontend
chmod 777 uploads
chmod 644 *.py
chmod 644 .htaccess
chmod 644 .env
```

## Настройка Python приложения в панели

После установки зависимостей в панели Spaceship:

1. Найдите настройки Python приложения
2. Укажите:
   - **Entry Point:** `wsgi:application`
   - **Working Directory:** `zakup.one`
   - **Python Version:** 3.11 или доступная
3. Перезапустите приложение

## Проверка

После настройки проверьте:
- https://www.zakup.one/api/v1/health



