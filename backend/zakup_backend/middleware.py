"""
Middleware для исключения API эндпоинтов из CSRF проверки
"""
from django.utils.deprecation import MiddlewareMixin
from django.views.decorators.csrf import csrf_exempt


class DisableCSRFForAPI(MiddlewareMixin):
    """
    Отключает CSRF проверку для всех API эндпоинтов и /kojoyun/
    """
    def process_request(self, request):
        if request.path.startswith('/api/') or request.path.startswith('/kojoyun/') or request.path.startswith('/admin/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
            # Также отключаем CSRF на уровне view
            from django.views.decorators.csrf import csrf_exempt
            request.csrf_exempt = True
        return None


