"""
ASGI config for zakup_one project.
"""
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'zakup_one.settings')

application = get_asgi_application()

