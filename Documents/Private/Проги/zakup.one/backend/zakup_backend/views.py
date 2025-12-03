from django.http import JsonResponse


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
            'admin_panel': '/admin/',
        }
    })


