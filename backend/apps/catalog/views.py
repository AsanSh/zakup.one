from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from django.db import models
from apps.users.permissions import IsAdminRole
from .models import Product, Category
from .serializers import ProductSerializer, ProductCreateUpdateSerializer, CategorySerializer


class ProductViewSet(ModelViewSet):
    permission_classes = [IsAdminRole]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer

    def get_queryset(self):
        # По умолчанию показываем только активные товары (как для клиентов)
        # Админ может увидеть неактивные, если явно передаст is_active=false
        queryset = Product.objects.filter(is_active=True)
        
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
        
        # Фильтрация по активности (админ может показать неактивные, передав is_active=false)
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            if is_active.lower() == 'false':
                # Если явно запрошены неактивные, показываем все
                queryset = Product.objects.all()
                # Применяем остальные фильтры
                if search:
                    queryset = queryset.filter(
                        models.Q(name__icontains=search) | models.Q(article__icontains=search)
                    )
                if is_recommended is not None:
                    queryset = queryset.filter(is_recommended=is_recommended.lower() == 'true')
                if is_promotional is not None:
                    queryset = queryset.filter(is_promotional=is_promotional.lower() == 'true')
            elif is_active.lower() == 'true':
                queryset = queryset.filter(is_active=True)
        
        # Фильтрация по поставщику
        supplier_id = self.request.query_params.get('supplier_id', None)
        if supplier_id:
            queryset = queryset.filter(supplier_id=supplier_id)
        
        # Сортировка по умолчанию - по названию (алфавит)
        ordering = self.request.query_params.get('ordering', 'name')
        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('name')
        
        return queryset


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
    permission_classes = [IsAdminRole]


class ProductBatchUpdateView(APIView):
    """Массовое обновление товаров"""
    permission_classes = [IsAdminRole]

    def post(self, request):
        product_ids = request.data.get('product_ids', [])
        if not product_ids:
            return Response(
                {'error': 'Не указаны ID товаров'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Получаем товары
        products = Product.objects.filter(id__in=product_ids)
        if not products.exists():
            return Response(
                {'error': 'Товары не найдены'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Параметры для обновления
        update_data = {}
        
        # Наценка
        if 'markup_percent' in request.data:
            markup_percent = request.data.get('markup_percent')
            if markup_percent is not None:
                update_data['markup_percent'] = markup_percent
        
        # Поставщик
        if 'supplier_id' in request.data:
            supplier_id = request.data.get('supplier_id')
            if supplier_id:
                from apps.suppliers.models import Supplier
                try:
                    supplier = Supplier.objects.get(id=supplier_id)
                    update_data['supplier'] = supplier
                except Supplier.DoesNotExist:
                    return Response(
                        {'error': 'Поставщик не найден'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            elif supplier_id is None:
                update_data['supplier'] = None
        
        # Метки
        if 'is_recommended' in request.data:
            update_data['is_recommended'] = request.data.get('is_recommended')
        
        if 'is_promotional' in request.data:
            update_data['is_promotional'] = request.data.get('is_promotional')
        
        if 'is_active' in request.data:
            update_data['is_active'] = request.data.get('is_active')

        # Обновляем товары
        # Если обновляется наценка, нужно пересчитать final_price
        if 'markup_percent' in update_data:
            # Обновляем через цикл, чтобы вызвать save() и пересчитать final_price
            updated_count = 0
            for product in products:
                product.markup_percent = update_data['markup_percent']
                if 'supplier' in update_data:
                    product.supplier = update_data['supplier']
                if 'is_recommended' in update_data:
                    product.is_recommended = update_data['is_recommended']
                if 'is_promotional' in update_data:
                    product.is_promotional = update_data['is_promotional']
                if 'is_active' in update_data:
                    product.is_active = update_data['is_active']
                product.save()  # Это вызовет пересчет final_price в методе save()
                updated_count += 1
        else:
            # Для остальных обновлений можно использовать bulk_update
            updated_count = products.update(**update_data)

        return Response({
            'message': f'Обновлено товаров: {updated_count}',
            'updated_count': updated_count
        })


class ProductBatchDeleteView(APIView):
    """Массовое удаление товаров"""
    permission_classes = [IsAdminRole]

    def post(self, request):
        product_ids = request.data.get('product_ids', [])
        if not product_ids:
            return Response(
                {'error': 'Не указаны ID товаров'},
                status=status.HTTP_400_BAD_REQUEST
            )

        products = Product.objects.filter(id__in=product_ids)
        deleted_count = products.count()
        products.delete()

        return Response({
            'message': f'Удалено товаров: {deleted_count}',
            'deleted_count': deleted_count
        })
