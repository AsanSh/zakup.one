"""
Serializers для товаров
"""
from rest_framework import serializers
from .models import Product, Supplier


class ProductSerializer(serializers.ModelSerializer):
    """Сериализатор товара"""
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'article', 'unit', 'price', 'category', 'country']
        read_only_fields = ['id']


class SupplierSerializer(serializers.ModelSerializer):
    """Сериализатор поставщика"""
    
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_email', 'contact_phone', 
                  'default_header_row', 'default_start_row', 'is_active']

