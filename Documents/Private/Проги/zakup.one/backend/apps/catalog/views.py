from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from django.db import models
from .models import Product, Category
from .serializers import ProductSerializer, ProductCreateUpdateSerializer, CategorySerializer


class ProductViewSet(ModelViewSet):
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all()
        
        # Поиск по названию и артикулу
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) | models.Q(article__icontains=search)
            )
        
        # Фильтрация по рекомендованным товарам
        is_recommended = self.request.query_params.get('is_recommended', None)
        if is_recommended is not None:
            queryset = queryset.filter(is_recommended=is_recommended.lower() == 'true')
        
        # Фильтрация по акционным товарам
        is_promotional = self.request.query_params.get('is_promotional', None)
        if is_promotional is not None:
            queryset = queryset.filter(is_promotional=is_promotional.lower() == 'true')
        
        # Фильтрация по активности
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Фильтрация по поставщику
        supplier_id = self.request.query_params.get('supplier_id', None)
        if supplier_id:
            queryset = queryset.filter(supplier_id=supplier_id)
        
        return queryset.order_by('-created_at')


class ProductListView(ListAPIView):
    """Публичный список товаров для клиентов"""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        
        # Фильтрация по рекомендованным товарам
        is_recommended = self.request.query_params.get('is_recommended', None)
        if is_recommended is not None:
            queryset = queryset.filter(is_recommended=is_recommended.lower() == 'true')
        
        # Фильтрация по акционным товарам
        is_promotional = self.request.query_params.get('is_promotional', None)
        if is_promotional is not None:
            queryset = queryset.filter(is_promotional=is_promotional.lower() == 'true')
        
        # Сортировка по умолчанию - по названию (алфавит)
        order_by = self.request.query_params.get('ordering', 'name')
        if order_by:
            queryset = queryset.order_by(order_by)
        else:
            queryset = queryset.order_by('name')
        
        return queryset


class ProductSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({'results': []})
        
        # TODO: Интеграция с Elasticsearch
        # Пока простой поиск по названию и артикулу
        products = Product.objects.filter(
            is_active=True
        ).filter(
            models.Q(name__icontains=query) | models.Q(article__icontains=query)
        )[:10]
        
        serializer = ProductSerializer(products, many=True)
        return Response({'results': serializer.data})


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
