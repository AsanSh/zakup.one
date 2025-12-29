"""
Custom exception handler for DRF to ensure JSON responses
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler that always returns JSON, never HTML
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # If response is None, it means DRF couldn't handle the exception
    # Return a generic JSON error response
    if response is None:
        logger.exception(f"Unhandled exception: {exc}")
        return Response(
            {
                'detail': str(exc) if str(exc) else 'Произошла ошибка сервера',
                'error': 'Internal server error'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Ensure response is JSON (not HTML)
    if hasattr(response, 'data'):
        # Response is already JSON
        return response
    
    # Fallback: return JSON error
    return Response(
        {
            'detail': str(exc) if str(exc) else 'Произошла ошибка',
            'error': 'Request failed'
        },
        status=response.status_code if hasattr(response, 'status_code') else status.HTTP_500_INTERNAL_SERVER_ERROR
    )
