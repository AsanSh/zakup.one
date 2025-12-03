from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from .models import Product
from .serializers import ProductSerializer


class ProductListView(ListAPIView):
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

