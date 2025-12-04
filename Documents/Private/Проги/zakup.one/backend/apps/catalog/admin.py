from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent')
    list_filter = ('parent',)
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'article', 'unit', 'base_price', 'markup_percent', 'final_price', 'is_active')
    list_filter = ('is_active', 'category')
    search_fields = ('name', 'article')
    
    def __init__(self, model, admin_site):
        super().__init__(model, admin_site)
        # Сохраняем оригинальное название
        if not hasattr(model._meta, '_verbose_name_plural_original'):
            model._meta._verbose_name_plural_original = model._meta.verbose_name_plural
    
    def get_model_perms(self, request):
        """
        Обновляем verbose_name_plural с количеством товаров при каждом запросе
        """
        # Получаем общее количество товаров
        total_count = Product.objects.count()
        # Восстанавливаем оригинальное название
        original = self.model._meta._verbose_name_plural_original
        # Обновляем с количеством
        self.model._meta.verbose_name_plural = f'{original} ({total_count})'
        return super().get_model_perms(request)
