"""
WSGI config for zakup_one project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""
import os
import sys
from pathlib import Path

# Определяем корневую директорию проекта
project_root = Path(__file__).resolve().parent.parent.parent

# Добавляем путь к проекту
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Меняем рабочую директорию
os.chdir(str(project_root / 'django_project'))

# Загружаем переменные окружения
env_file = project_root / '.env'
if env_file.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(str(env_file))
    except ImportError:
        pass

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'zakup_one.settings')

application = get_wsgi_application()

