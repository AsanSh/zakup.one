"""
Конфигурация для Spaceship хостинга
"""
import os

# Настройки для Spaceship
SPACESHIP_PYTHON_VERSION = "3.11"  # Укажите версию Python на Spaceship
SPACESHIP_WSGI_ENTRY = "wsgi:application"

# Пути для Spaceship
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "frontend", "dist")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

# Создаем необходимые директории если их нет
os.makedirs(UPLOADS_DIR, exist_ok=True)



