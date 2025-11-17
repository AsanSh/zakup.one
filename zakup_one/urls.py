"""
URL configuration for zakup_one project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import JsonResponse

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('api.urls')),
    path('health', lambda request: JsonResponse({'status': 'ok', 'message': 'API is running'})),
    path('api/v1/health', lambda request: JsonResponse({'status': 'ok', 'database': 'connected'})),
]

# Serve frontend
frontend_dist = BASE_DIR / 'frontend' / 'dist'
if frontend_dist.exists():
    # Serve static files from frontend/dist/assets
    urlpatterns += static('/assets/', document_root=frontend_dist / 'assets')
    
    # Serve index.html for SPA routing (must be last)
    def serve_frontend(request, path=''):
        return TemplateView.as_view(template_name='index.html')(request)
    
    urlpatterns += [
        path('', serve_frontend),
        path('<path:path>', serve_frontend),
    ]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
