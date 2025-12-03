from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet, PriceListViewSet, PriceListUploadView

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'pricelists', PriceListViewSet, basename='pricelist')

app_name = 'suppliers'

urlpatterns = [
    # Важно: upload должен быть ДО include(router.urls), чтобы не конфликтовать с роутером
    path('pricelists/upload/', PriceListUploadView.as_view(), name='pricelist-upload'),
    path('', include(router.urls)),
]
