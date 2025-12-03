from django.core.management.base import BaseCommand
from apps.catalog.models import Category, Product


class Command(BaseCommand):
    help = 'Создает тестовые товары для демонстрации'

    def handle(self, *args, **options):
        # Создаем категории
        armature_cat, _ = Category.objects.get_or_create(name='Арматура')
        tools_cat, _ = Category.objects.get_or_create(name='Инструменты')
        bricks_cat, _ = Category.objects.get_or_create(name='Кирпиц и блоки')

        # Арматура
        products_data = [
            {'name': 'Арматура А12', 'article': 'ARM-12', 'unit': 'M', 'category': armature_cat, 'origin': 'РФ', 'base_price': 85},
            {'name': 'Арматура А14', 'article': 'ARM-14', 'unit': 'M', 'category': armature_cat, 'origin': 'Китай', 'base_price': 120},
            {'name': 'Арматура А16', 'article': 'ARM-16', 'unit': 'M', 'category': armature_cat, 'origin': 'КР', 'base_price': 150},
            {'name': 'Арматура А18', 'article': 'ARM-18', 'unit': 'M', 'category': armature_cat, 'origin': 'РК', 'base_price': 190},
            {'name': 'Проволока вязальная', 'article': 'WIRE-1', 'unit': 'КГ', 'category': armature_cat, 'origin': 'РФ', 'base_price': 180},
            {'name': 'Арматура А12', 'article': 'ARM-12-2', 'unit': 'M', 'category': armature_cat, 'origin': 'КР', 'base_price': 85},
            {'name': 'Арматура А18', 'article': 'ARM-18-2', 'unit': 'M', 'category': armature_cat, 'origin': 'РК', 'base_price': 190},
            {'name': 'Проволока вязальная', 'article': 'WIRE-2', 'unit': 'КГ', 'category': armature_cat, 'origin': 'РФ', 'base_price': 180},
        ]

        # Инструменты
        tools_data = [
            {'name': 'Перфоратор', 'article': 'PERF-1', 'unit': 'Шт', 'category': tools_cat, 'origin': 'РФ', 'base_price': 8500},
            {'name': 'Дрель', 'article': 'DRILL-1', 'unit': 'Шт', 'category': tools_cat, 'origin': 'КР', 'base_price': 3500},
            {'name': 'Болгарка', 'article': 'GRIND-1', 'unit': 'Шт', 'category': tools_cat, 'origin': 'РК', 'base_price': 4500},
            {'name': 'Перфоратор', 'article': 'PERF-2', 'unit': 'Шт', 'category': tools_cat, 'origin': 'РК', 'base_price': 8500},
        ]

        # Кирпиц и блоки
        bricks_data = [
            {'name': 'Кирпич красный', 'article': 'BRICK-1', 'unit': 'Шт', 'category': bricks_cat, 'origin': 'РФ', 'base_price': 25},
            {'name': 'Кирпич белый', 'article': 'BRICK-2', 'unit': 'Шт', 'category': bricks_cat, 'origin': 'Китай', 'base_price': 30},
            {'name': 'Блок керамзитный', 'article': 'BLOCK-1', 'unit': 'Шт', 'category': bricks_cat, 'origin': 'КР', 'base_price': 120},
            {'name': 'Блок газобетонный', 'article': 'BLOCK-2', 'unit': 'Шт', 'category': bricks_cat, 'origin': 'РК', 'base_price': 150},
            {'name': 'Кирпич облицовочный', 'article': 'BRICK-3', 'unit': 'Шт', 'category': bricks_cat, 'origin': 'РФ', 'base_price': 45},
            {'name': 'Блок пенобетонный', 'article': 'BLOCK-3', 'unit': 'Шт', 'category': bricks_cat, 'origin': 'Китай', 'base_price': 180},
            {'name': 'Кирпич силикатный', 'article': 'BRICK-4', 'unit': 'Шт', 'category': bricks_cat, 'origin': 'РК', 'base_price': 35},
        ]

        all_products = products_data + tools_data + bricks_data

        created = 0
        for prod_data in all_products:
            product, created_flag = Product.objects.get_or_create(
                article=prod_data['article'],
                defaults={
                    'name': prod_data['name'],
                    'unit': prod_data['unit'],
                    'category': prod_data['category'],
                    'origin': prod_data['origin'],
                    'base_price': prod_data['base_price'],
                    'is_active': True,
                }
            )
            if created_flag:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'Создано {created} новых товаров. Всего товаров: {Product.objects.count()}'))


