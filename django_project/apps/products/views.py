"""
Views для товаров
"""
from rest_framework import viewsets, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from .models import Product
from .serializers import ProductSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def search_products(request):
    """Поиск товаров"""
    q = request.query_params.get('q', '')
    limit = int(request.query_params.get('limit', 10000))
    
    queryset = Product.objects.filter(is_active=True)
    
    if q:
        queryset = queryset.filter(
            Q(name__icontains=q) |
            Q(article__icontains=q) |
            Q(category__icontains=q)
        )
    
    queryset = queryset[:limit]
    serializer = ProductSerializer(queryset, many=True)
    return Response(serializer.data)

