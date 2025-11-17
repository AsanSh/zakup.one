"""
API views для товаров
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from products.models import Product
from django.db.models import Q


@api_view(['GET'])
@permission_classes([AllowAny])
def search_products(request):
    """
    Поиск товаров
    GET /api/v1/products/search?q=запрос&limit=100
    """
    query = request.GET.get('q', '').strip()
    limit = int(request.GET.get('limit', 10000))
    
    # Если запрос пустой, возвращаем все товары
    if not query:
        products = Product.objects.filter(is_active=True)[:limit]
    else:
        # Поиск по названию (регистронезависимый)
        products = Product.objects.filter(
            Q(is_active=True) &
            Q(name__icontains=query)
        )[:limit]
    
    result = []
    for product in products:
        result.append({
            'id': product.id,
            'name': product.name,
            'article': product.article or '',
            'unit': product.unit or '',
            'price': product.price,
            'category': product.category or '',
            'country': product.country or '',
        })
    
    return Response(result)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_product(request, product_id):
    """
    Получить товар по ID
    GET /api/v1/products/{product_id}
    """
    try:
        product = Product.objects.get(id=product_id, is_active=True)
        return Response({
            'id': product.id,
            'name': product.name,
            'article': product.article or '',
            'unit': product.unit or '',
            'price': product.price,
            'category': product.category or '',
            'country': product.country or '',
        })
    except Product.DoesNotExist:
        return Response({'error': 'Товар не найден'}, status=404)

