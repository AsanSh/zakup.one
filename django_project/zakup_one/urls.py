"""
URL configuration for zakup_one project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import JsonResponse
from pathlib import Path

def health_check(request):
    """Health check endpoint"""
    return JsonResponse({
        "status": "ok",
        "message": "API is running",
        "service": "zakup.one"
    })

def api_health_check(request):
    """API health check with database"""
    from django.db import connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({"status": "ok", "database": "connected"})
    except Exception as e:
        return JsonResponse({"status": "ok", "database": "error", "error": str(e)})

urlpatterns = [
    # Health checks
    path('health', health_check, name='health'),
    path('api/v1/health', api_health_check, name='api_health'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # API
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/products/', include('apps.products.urls')),
    path('api/v1/orders/', include('apps.orders.urls')),
    path('api/v1/admin/', include('apps.admin_panel.urls')),
    
    # Serve frontend for SPA routing
    re_path(r'^(?!api|admin|static|media|assets).*$', TemplateView.as_view(template_name='index.html')),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve frontend static files
frontend_dist = Path(__file__).resolve().parent.parent.parent / 'frontend' / 'dist'
if frontend_dist.exists():
    from django.views.static import serve
    urlpatterns += [
        re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': frontend_dist / 'assets'}),
    ]

