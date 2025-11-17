"""
WSGI entry point for Django on Spaceship hosting
"""
import os
import sys
from pathlib import Path

# Определяем корневую директорию проекта
project_root = Path(__file__).parent.absolute()

# Добавляем путь к Django проекту
django_project = project_root / 'django_project'
if str(django_project) not in sys.path:
    sys.path.insert(0, str(django_project))

# Меняем рабочую директорию
os.chdir(str(django_project))

# Попытка активировать virtualenv
activate_this = '/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate_this.py'
if os.path.exists(activate_this):
    try:
        with open(activate_this) as f:
            exec(f.read(), {'__file__': activate_this})
    except Exception:
        pass

# Загружаем переменные окружения
env_file = project_root / '.env'
if env_file.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(str(env_file))
    except ImportError:
        pass

# Импортируем Django WSGI application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'zakup_one.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

