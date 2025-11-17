"""
URL configuration for zakup_one project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import JsonResponse, HttpResponse
from pathlib import Path
import os

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

def serve_frontend_asset(request, path):
    """Serve frontend assets"""
    from django.views.static import serve
    project_root = Path(__file__).resolve().parent.parent.parent.parent
    frontend_dist = project_root / 'frontend' / 'dist'
    assets_dir = frontend_dist / 'assets'
    
    if assets_dir.exists():
        return serve(request, path, document_root=str(assets_dir))
    else:
        return JsonResponse({"error": "Assets not found"}, status=404)

def serve_frontend(request, path=''):
    """Serve frontend index.html for SPA routing"""
    try:
        # Путь к index.html
        project_root = Path(__file__).resolve().parent.parent.parent.parent
        frontend_dist = project_root / 'frontend' / 'dist'
        index_path = frontend_dist / 'index.html'
        
        if index_path.exists():
            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return HttpResponse(content, content_type='text/html')
        else:
            # Fallback: попробуем через TemplateView
            return TemplateView.as_view(template_name='index.html')(request)
    except Exception as e:
        import traceback
        return JsonResponse({
            "error": "Error serving frontend",
            "message": str(e),
            "traceback": traceback.format_exc() if settings.DEBUG else "Enable DEBUG to see traceback",
            "index_path": str(index_path) if 'index_path' in locals() else "N/A"
        }, status=500)

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
    
    # Serve frontend static files (assets)
    re_path(r'^assets/(?P<path>.*)$', serve_frontend_asset, name='frontend_assets'),
    
    # Serve frontend for SPA routing (должно быть последним)
    re_path(r'^(?!api|admin|static|media|assets|health).*$', serve_frontend, name='frontend'),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
