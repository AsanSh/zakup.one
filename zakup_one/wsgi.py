"""
WSGI config for zakup_one project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""
import os
import sys
from pathlib import Path

# Определяем корневую директорию проекта
project_root = Path(__file__).resolve().parent.parent

# Добавляем корневую директорию в Python path
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Меняем рабочую директорию
os.chdir(str(project_root))

# Попытка активировать virtualenv (если существует)
activate_this = '/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate_this.py'
if os.path.exists(activate_this):
    try:
        with open(activate_this) as f:
            exec(f.read(), {'__file__': activate_this})
    except Exception:
        pass

# Загружаем переменные окружения
from dotenv import load_dotenv
env_file = project_root / '.env'
if env_file.exists():
    load_dotenv(str(env_file))

# Создаем необходимые директории
for dir_name in ['uploads', 'downloads', 'media', 'staticfiles']:
    dir_path = project_root / dir_name
    try:
        dir_path.mkdir(exist_ok=True)
        os.chmod(str(dir_path), 0o777)
    except Exception:
        pass

# Настраиваем Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'zakup_one.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

