from django.urls import path
from .views import OrderListView, OrderCreateView, OrderDetailView, OrderParseTextView, OrderParseExcelView, OrderParseImageView

app_name = 'orders'

urlpatterns = [
    path('', OrderListView.as_view(), name='orders'),
    path('create/', OrderCreateView.as_view(), name='create'),
    path('<int:pk>/', OrderDetailView.as_view(), name='detail'),
    path('parse-text/', OrderParseTextView.as_view(), name='parse-text'),
    path('parse-excel/', OrderParseExcelView.as_view(), name='parse-excel'),
    path('parse-image/', OrderParseImageView.as_view(), name='parse-image'),
]



