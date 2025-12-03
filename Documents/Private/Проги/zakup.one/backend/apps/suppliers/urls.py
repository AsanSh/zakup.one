from django.urls import path
from .views import SupplierViewSet, PriceListUploadView, PriceListProcessView

app_name = 'suppliers'

urlpatterns = [
    path('suppliers/', SupplierViewSet.as_view({'get': 'list', 'post': 'create'}), name='suppliers'),
    path('pricelists/upload/', PriceListUploadView.as_view(), name='pricelist-upload'),
    path('pricelists/<int:pk>/process/', PriceListProcessView.as_view(), name='pricelist-process'),
]



