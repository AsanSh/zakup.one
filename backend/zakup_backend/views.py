from django.http import JsonResponse, HttpResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import os


def api_root(request):
    """Корневой эндпоинт API"""
    return JsonResponse({
        'name': 'ZAKUP.ONE API',
        'version': '1.0.0',
        'endpoints': {
            'auth': {
                'login': '/api/auth/login/',
                'register': '/api/auth/register/',
            },
            'catalog': {
                'products': '/api/catalog/products/',
                'search': '/api/catalog/search/?q=',
            },
            'orders': {
                'list': '/api/orders/',
                'create': '/api/orders/create/',
                'parse_text': '/api/orders/parse-text/',
                'parse_excel': '/api/orders/parse-excel/',
                'parse_image': '/api/orders/parse-image/',
            },
            'admin': {
                'suppliers': '/api/admin/suppliers/',
                'pricelists_upload': '/api/admin/pricelists/upload/',
            },
        }
    })


@csrf_exempt
def redirect_to_frontend(request):
    """Блокировка доступа к Django админке - возвращаем простой 404"""
    # Django админка отключена, используйте React админку
    response = HttpResponse('Django Admin is disabled. Use React admin panel.', status=404)
    response['Content-Type'] = 'text/plain; charset=utf-8'
    return response


def frontend_catchall(request):
    """Catch-all для фронтенд роутов - возвращает index.html для React Router"""
    # Путь к index.html фронтенда
    frontend_index = os.path.join(settings.BASE_DIR, '..', 'frontend', 'dist', 'index.html')
    
    # Если файл существует (в production), возвращаем его
    if os.path.exists(frontend_index):
        return FileResponse(open(frontend_index, 'rb'), content_type='text/html')
    
    # В development режиме возвращаем простой ответ, так как фронтенд работает отдельно
    return HttpResponse('''
        <!DOCTYPE html>
        <html>
        <head>
            <title>ZAKUP.ONE</title>
            <meta http-equiv="refresh" content="0;url=http://localhost:5173/admin/">
        </head>
        <body>
            <p>Redirecting to frontend...</p>
        </body>
        </html>
    ''', content_type='text/html')
