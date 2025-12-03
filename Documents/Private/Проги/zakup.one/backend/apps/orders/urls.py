from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, OrderListView, OrderCreateView, OrderDetailView, OrderDeleteView, OrderParseTextView, OrderParseExcelView, OrderParseImageView

router = DefaultRouter()
router.register(r'orders-admin', OrderViewSet, basename='order-admin')

app_name = 'orders'

urlpatterns = [
    path('', include(router.urls)),
    path('', OrderListView.as_view(), name='orders'),
    path('create/', OrderCreateView.as_view(), name='create'),
    path('<int:pk>/', OrderDetailView.as_view(), name='detail'),
    path('<int:pk>/delete/', OrderDeleteView.as_view(), name='delete'),
    path('parse-text/', OrderParseTextView.as_view(), name='parse-text'),
    path('parse-excel/', OrderParseExcelView.as_view(), name='parse-excel'),
    path('parse-image/', OrderParseImageView.as_view(), name='parse-image'),
]
