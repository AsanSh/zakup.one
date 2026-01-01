"""
URL configuration for zakup_backend project.
"""
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('', views.api_root, name='api-root'),
    # Django админка отключена - фронтенд обрабатывает все роуты через React Router
    path('api/auth/', include('apps.users.urls')),
    path('api/catalog/', include('apps.catalog.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/admin/', include('apps.suppliers.urls')),
    # Catch-all для фронтенд роутов (React Router)
    path('kojoyun/', views.frontend_catchall, name='frontend-catchall'),
    path('admin/', views.frontend_catchall, name='frontend-catchall-old'),  # Редирект со старого пути
]

if settings.DEBUG:
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns
    urlpatterns += staticfiles_urlpatterns()

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


