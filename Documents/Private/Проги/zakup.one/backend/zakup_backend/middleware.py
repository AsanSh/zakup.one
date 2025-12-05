"""
Middleware для исключения API эндпоинтов из CSRF проверки
"""
import logging
from django.utils.deprecation import MiddlewareMixin
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)


class DisableCSRFForAPI(MiddlewareMixin):
    """
    Отключает CSRF проверку для всех API эндпоинтов
    """
    def process_request(self, request):
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
            logger.debug(f'CSRF disabled for API path: {request.path}, method: {request.method}')
        return None


