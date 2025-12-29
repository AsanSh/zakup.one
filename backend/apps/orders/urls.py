from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, OrderListView, OrderCreateView, OrderDetailView, OrderDeleteView, OrderParseTextView, OrderParseExcelView, OrderParseImageView, InvoiceViewSet, DeliveryTrackingViewSet

# ViewSet для основных операций (создание, чтение, обновление, удаление)
router = DefaultRouter()
router.register(r'', OrderViewSet, basename='order')  # Регистрируем на корне /api/orders/
router.register(r'orders-admin', OrderViewSet, basename='order-admin')  # Для админки
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'tracking', DeliveryTrackingViewSet, basename='tracking')

app_name = 'orders'

urlpatterns = [
    # ViewSet обрабатывает:
    # GET /api/orders/ - список заявок
    # POST /api/orders/ - создание заявки
    # GET /api/orders/<id>/ - детали заявки
    # PUT/PATCH /api/orders/<id>/ - обновление заявки
    # DELETE /api/orders/<id>/ - удаление заявки
    path('', include(router.urls)),
    # Дополнительные эндпоинты
    path('parse-text/', OrderParseTextView.as_view(), name='parse-text'),
    path('parse-excel/', OrderParseExcelView.as_view(), name='parse-excel'),
    path('parse-image/', OrderParseImageView.as_view(), name='parse-image'),
]
