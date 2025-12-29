from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from apps.users.permissions import IsAdminRole
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction
from django.core.files.storage import default_storage
import threading
import logging
import os
from .models import Supplier, PriceList
from .parsers import ExcelPriceListParser
from apps.catalog.models import Product, Category

logger = logging.getLogger(__name__)
from .serializers import (
    SupplierSerializer, SupplierCreateUpdateSerializer,
    PriceListSerializer, PriceListCreateSerializer
)


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    permission_classes = [IsAdminRole]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SupplierCreateUpdateSerializer
        return SupplierSerializer

    def get_queryset(self):
        queryset = Supplier.objects.all()
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(SupplierSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_markup = instance.markup_som
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            # Если наценка изменилась, пересчитываем цены всех товаров поставщика
            instance.refresh_from_db()
            if old_markup != instance.markup_som:
                from apps.catalog.models import Product
                from decimal import Decimal
                markup = Decimal(str(instance.markup_som or 0))
                products = Product.objects.filter(supplier=instance)
                updated_count = 0
                for product in products:
                    base = Decimal(str(product.base_price))
                    product.final_price = base + markup
                    product.save(update_fields=['final_price'])
                    updated_count += 1
                logger.info(f'Пересчитано {updated_count} товаров поставщика {instance.name} с наценкой {markup} сом')
            return Response(SupplierSerializer(serializer.instance).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PriceListViewSet(viewsets.ModelViewSet):
    queryset = PriceList.objects.all()
    serializer_class = PriceListSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        queryset = PriceList.objects.all()
        supplier_id = self.request.query_params.get('supplier_id', None)
        status_filter = self.request.query_params.get('status', None)
        
        if supplier_id:
            queryset = queryset.filter(supplier_id=supplier_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-uploaded_at')

    def create(self, request, *args, **kwargs):
        serializer = PriceListCreateSerializer(data=request.data)
        if serializer.is_valid():
            price_list = serializer.save()
            # TODO: Запустить асинхронную обработку прайс-листа
            return Response(PriceListSerializer(price_list).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """Удаление прайс-листа с удалением файла и связанных товаров"""
        price_list = self.get_object()
        supplier = price_list.supplier
        
        # Проверяем, сколько прайс-листов останется у поставщика после удаления
        remaining_price_lists_count = supplier.price_lists.exclude(id=price_list.id).count()
        
        # Удаляем товары, которые были импортированы из этого прайс-листа
        try:
            from apps.catalog.models import Product
            
            # Удаляем товары, связанные с этим прайс-листом
            products_to_delete = Product.objects.filter(price_list=price_list)
            products_count = products_to_delete.count()
            
            if products_count > 0:
                products_to_delete.delete()
                logger.info(f'Удалено {products_count} товаров, связанных с прайс-листом {price_list.id}')
            
            # Если это последний прайс-лист поставщика, удаляем все товары поставщика,
            # которые не связаны ни с каким прайс-листом (старые товары, импортированные до добавления поля price_list)
            if remaining_price_lists_count == 0:
                old_products = Product.objects.filter(supplier=supplier, price_list__isnull=True)
                old_products_count = old_products.count()
                
                if old_products_count > 0:
                    old_products.delete()
                    logger.info(f'Удалено {old_products_count} старых товаров поставщика {supplier.name} (без связи с прайс-листом)')
                    
        except Exception as e:
            logger.error(f'Ошибка при удалении товаров прайс-листа {price_list.id}: {str(e)}')
        
        # Удаляем файл, если он существует
        if price_list.file:
            try:
                if default_storage.exists(price_list.file.name):
                    default_storage.delete(price_list.file.name)
                    logger.info(f'Файл прайс-листа {price_list.file.name} удален')
            except Exception as e:
                logger.error(f'Ошибка при удалении файла прайс-листа {price_list.file.name}: {str(e)}')
        
        # Удаляем сам прайс-лист
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Повторная обработка прайс-листа"""
        price_list = self.get_object()
        try:
            price_list.status = 'PROCESSING'
            price_list.save()
            logger.info(f'Начата повторная обработка прайс-листа {price_list.id}')
            
            # Реальный парсинг файла
            def reprocess_price_list(pl_id):
                try:
                    logger.info(f'Поток повторной обработки запущен для прайс-листа {pl_id}')
                    
                    with transaction.atomic():
                        pl = PriceList.objects.select_for_update().get(pk=pl_id)
                        
                        # Получаем путь к файлу
                        try:
                            file_path = pl.file.path
                        except:
                            from django.conf import settings
                            import os
                            file_path = os.path.join(settings.MEDIA_ROOT, pl.file.name)
                        
                        # Проверяем метод парсинга
                        parsing_method = pl.parsing_method or 'EXCEL'
                        
                        if parsing_method == 'EXCEL':
                            logger.info(f'Начинаем повторный парсинг файла: {file_path}')
                            parser = ExcelPriceListParser(file_path)
                            result = parser.parse()
                            
                            found_count = len(result.get("products", []))
                            logger.info(f'Парсинг завершен. Найдено товаров: {found_count}')
                            
                            # Импортируем товары в базу данных
                            imported_count = import_products_from_parser(
                                result, 
                                pl.supplier,
                                pl
                            )
                            
                            pl.status = 'PROCESSED'
                            pl.processed_at = timezone.now()
                            pl.products_count = imported_count
                            pl.log = f"Импортировано товаров: {found_count}, обработано: {imported_count}"
                            pl.save()
                            
                            logger.info(f'Прайс-лист {pl_id} успешно переимпортирован. Импортировано товаров: {imported_count}')
                        else:
                            pl.status = 'PROCESSED'
                            pl.processed_at = timezone.now()
                            pl.products_count = 0
                            pl.log = f"Метод парсинга {parsing_method} пока не реализован"
                            pl.save()
                            logger.warning(f'Метод парсинга {parsing_method} не реализован для прайс-листа {pl_id}')
                except PriceList.DoesNotExist:
                    logger.error(f'Прайс-лист {pl_id} не найден в базе данных')
                except Exception as e:
                    logger.error(f'Ошибка повторной обработки прайс-листа {pl_id}: {str(e)}')
                    try:
                        with transaction.atomic():
                            pl = PriceList.objects.select_for_update().get(pk=pl_id)
                            pl.status = 'FAILED'
                            pl.log = str(e)
                            pl.save()
                    except Exception as save_error:
                        logger.error(f'Ошибка сохранения статуса FAILED для прайс-листа {pl_id}: {str(save_error)}')
            
            # Запускаем обработку в отдельном потоке
            thread = threading.Thread(target=reprocess_price_list, args=(price_list.id,))
            thread.daemon = False
            thread.start()
            logger.info(f'Поток повторной обработки запущен для прайс-листа {price_list.id}')
            
            return Response(PriceListSerializer(price_list).data)
        except Exception as e:
            price_list.status = 'FAILED'
            price_list.log = str(e)
            price_list.save()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PriceListUploadView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request):
        file = request.FILES.get('file')
        supplier_id = request.data.get('supplier_id')
        parsing_method = request.data.get('parsing_method', None)
        parsing_config = request.data.get('parsing_config', {})
        
        if not file:
            return Response({'error': 'Файл обязателен для загрузки'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not supplier_id:
            return Response({'error': 'ID поставщика обязателен'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            supplier = Supplier.objects.get(pk=supplier_id)
        except Supplier.DoesNotExist:
            return Response({'error': f'Поставщик с ID {supplier_id} не найден'}, status=status.HTTP_404_NOT_FOUND)
        except (ValueError, TypeError):
            return Response({'error': 'Неверный формат ID поставщика'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Проверяем размер файла (максимум 50MB)
            if file.size > 50 * 1024 * 1024:
                return Response({'error': 'Размер файла превышает 50MB'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Проверяем расширение файла
            allowed_extensions = ['.xlsx', '.xls', '.csv', '.pdf']
            file_name = file.name.lower()
            if not any(file_name.endswith(ext) for ext in allowed_extensions):
                return Response({
                    'error': f'Неподдерживаемый формат файла. Разрешенные форматы: {", ".join(allowed_extensions)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            price_list = PriceList.objects.create(
                supplier=supplier,
                file=file,
                parsing_method=parsing_method or supplier.default_parsing_method,
                parsing_config=parsing_config
            )
            
                # Автоматически запускаем обработку прайс-листа
            try:
                price_list.status = 'PROCESSING'
                price_list.save()
                logger.info(f'Начата обработка прайс-листа {price_list.id}')
                
                # Реальный парсинг файла
                def process_price_list(pl_id):
                    try:
                        logger.info(f'Поток обработки запущен для прайс-листа {pl_id}')
                        
                        # Получаем объект заново из базы данных
                        with transaction.atomic():
                            pl = PriceList.objects.select_for_update().get(pk=pl_id)
                            
                            # Получаем путь к файлу
                            try:
                                file_path = pl.file.path
                            except:
                                # Если .path не работает, используем .name и получаем полный путь
                                from django.conf import settings
                                import os
                                file_path = os.path.join(settings.MEDIA_ROOT, pl.file.name)
                            
                            # Проверяем метод парсинга
                            parsing_method = pl.parsing_method or 'EXCEL'
                            
                            if parsing_method == 'EXCEL':
                                # Парсим Excel файл
                                logger.info(f'Начинаем парсинг файла: {file_path}')
                                parser = ExcelPriceListParser(file_path)
                                result = parser.parse()
                                
                                found_count = len(result.get("products", []))
                                logger.info(f'Парсинг завершен. Найдено товаров: {found_count}, категорий: {len(result.get("categories", []))}')
                                
                                # Импортируем товары в базу данных
                                imported_count = import_products_from_parser(
                                    result, 
                                    pl.supplier,
                                    pl
                                )
                                
                                pl.status = 'PROCESSED'
                                pl.processed_at = timezone.now()
                                pl.products_count = imported_count
                                pl.log = f"Импортировано товаров: {found_count}, обработано: {imported_count}"
                                pl.save()
                                
                                logger.info(f'Прайс-лист {pl_id} успешно обработан. Импортировано товаров: {imported_count}')
                            else:
                                # Для других методов парсинга пока не реализовано
                                pl.status = 'PROCESSED'
                                pl.processed_at = timezone.now()
                                pl.products_count = 0
                                pl.log = f"Метод парсинга {parsing_method} пока не реализован"
                                pl.save()
                                logger.warning(f'Метод парсинга {parsing_method} не реализован для прайс-листа {pl_id}')
                    except PriceList.DoesNotExist:
                        logger.error(f'Прайс-лист {pl_id} не найден в базе данных')
                    except Exception as e:
                        logger.error(f'Ошибка обработки прайс-листа {pl_id}: {str(e)}')
                        try:
                            with transaction.atomic():
                                pl = PriceList.objects.select_for_update().get(pk=pl_id)
                                pl.status = 'FAILED'
                                pl.log = str(e)
                                pl.save()
                        except Exception as save_error:
                            logger.error(f'Ошибка сохранения статуса FAILED для прайс-листа {pl_id}: {str(save_error)}')
                
                # Запускаем обработку в отдельном потоке (не daemon, чтобы он успел выполниться)
                thread = threading.Thread(target=process_price_list, args=(price_list.id,))
                thread.daemon = False  # Не daemon, чтобы поток успел выполниться
                thread.start()
                logger.info(f'Поток обработки запущен для прайс-листа {price_list.id}')
            except Exception as e:
                logger.error(f'Ошибка при запуске обработки прайс-листа: {str(e)}')
                price_list.status = 'FAILED'
                price_list.log = str(e)
                price_list.save()
            
            return Response(PriceListSerializer(price_list).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'error': f'Ошибка при сохранении прайс-листа: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def import_products_from_parser(parser_result: dict, supplier: Supplier, price_list: PriceList) -> int:
    """
    Импортирует товары из результата парсинга в базу данных
    
    Args:
        parser_result: Результат парсинга с ключами 'products', 'categories'
        supplier: Поставщик
        price_list: Прайс-лист
    
    Returns:
        Количество импортированных товаров
    """
    imported_count = 0
    
    try:
        from apps.catalog.models import Category, Product
        
        # Создаем категории, если их нет
        category_map = {}
        for cat_name in parser_result.get('categories', []):
            if cat_name:
                category, created = Category.objects.get_or_create(
                    name=cat_name,
                    defaults={'name': cat_name}
                )
                category_map[cat_name] = category
        
        # Импортируем товары
        products_data = parser_result.get('products', [])
        
        for product_data in products_data:
            try:
                # Проверяем, существует ли товар с таким артикулом
                article = product_data.get('article')
                if not article:
                    continue
                
                # Получаем или создаем категорию
                category = None
                if product_data.get('category'):
                    category = category_map.get(product_data['category'])
                
                # Получаем наценку поставщика в сомах
                markup_som = float(supplier.markup_som or 0)
                base_price = float(product_data.get('price', 0))
                final_price = base_price + markup_som
                
                # Создаем или обновляем товар (по артикулу и поставщику)
                product, created = Product.objects.update_or_create(
                    article=article,
                    supplier=supplier,
                    defaults={
                        'name': product_data.get('name', ''),
                        'unit': product_data.get('unit', 'шт'),
                        'category': category,
                        'base_price': base_price,
                        'markup_percent': 0,  # Процентная наценка не используется
                        'final_price': final_price,  # Итоговая цена = цена поставщика + наценка в сомах
                        'is_active': True,
                        'price_list': price_list,  # Связываем товар с прайс-листом
                    }
                )
                
                imported_count += 1  # Считаем и созданные, и обновленные товары
                if created:
                    logger.info(f'Создан товар: {product.name} ({product.article})')
                else:
                    logger.info(f'Обновлен товар: {product.name} ({product.article})')
                    
            except Exception as e:
                logger.error(f'Ошибка импорта товара {product_data.get("name", "unknown")}: {str(e)}')
                continue
        
        logger.info(f'Импортировано товаров: {imported_count} из {len(products_data)}')
        return imported_count
        
    except Exception as e:
        logger.error(f'Ошибка импорта товаров: {str(e)}')
        raise


class AdminStatsView(APIView):
    """API endpoint для получения статистики админ-панели"""
    permission_classes = [IsAdminRole]
    
    def get(self, request):
        from apps.catalog.models import Product, Category
        from apps.orders.models import Order
        from apps.users.models import User
        
        stats = {
            'suppliers': {
                'total': Supplier.objects.count(),
                'active': Supplier.objects.filter(is_active=True).count(),
            },
            'products': {
                'total': Product.objects.count(),
                'active': Product.objects.filter(is_active=True).count(),
            },
            'categories': {
                'total': Category.objects.count(),
            },
            'orders': {
                'total': Order.objects.count(),
                'pending': Order.objects.filter(status='PENDING').count(),
                'processing': Order.objects.filter(status='PROCESSING').count(),
                'completed': Order.objects.filter(status='COMPLETED').count(),
                'cancelled': Order.objects.filter(status='CANCELLED').count(),
            },
            'clients': {
                'total': User.objects.filter(role='CLIENT').count(),
                'active': User.objects.filter(role='CLIENT', is_active=True).count(),
            },
            'price_lists': {
                'total': PriceList.objects.count(),
            },
        }
        
        return Response(stats)
