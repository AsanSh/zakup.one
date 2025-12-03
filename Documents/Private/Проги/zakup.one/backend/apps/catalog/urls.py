from django.urls import path
from .views import ProductListView, ProductSearchView

app_name = 'catalog'

urlpatterns = [
    path('products/', ProductListView.as_view(), name='products'),
    path('search/', ProductSearchView.as_view(), name='search'),
]



