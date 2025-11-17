"""
Custom middleware for error handling
"""
from django.http import JsonResponse
import traceback
import logging

logger = logging.getLogger(__name__)


class JSONErrorMiddleware:
    """Middleware для возврата JSON ошибок вместо HTML"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        return response
    
    def process_exception(self, request, exc):
        """Обрабатываем исключения и возвращаем JSON"""
        import sys
        from django.conf import settings
        
        debug_mode = getattr(settings, 'DEBUG', False)
        
        error_info = {
            'error': type(exc).__name__,
            'message': str(exc),
        }
        
        if debug_mode:
            error_info['traceback'] = traceback.format_exc()
        
        logger.error(f"Exception in {request.path}: {exc}", exc_info=True)
        
        return JsonResponse(error_info, status=500)

