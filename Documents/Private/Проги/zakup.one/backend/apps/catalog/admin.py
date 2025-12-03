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



