from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, ProductListView, ProductSearchView, CategoryViewSet,
    ProductBatchUpdateView, ProductBatchDeleteView
)

router = DefaultRouter()
router.register(r'products-admin', ProductViewSet, basename='product-admin')
router.register(r'categories', CategoryViewSet, basename='category')

app_name = 'catalog'

urlpatterns = [
    path('', include(router.urls)),
    path('products/', ProductListView.as_view(), name='products'),
    path('search/', ProductSearchView.as_view(), name='search'),
    path('products-admin/batch-update/', ProductBatchUpdateView.as_view(), name='products-batch-update'),
    path('products-admin/batch-delete/', ProductBatchDeleteView.as_view(), name='products-batch-delete'),
]
