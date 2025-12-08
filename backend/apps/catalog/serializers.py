from rest_framework import serializers
from .models import Product, Category
from apps.suppliers.serializers import SupplierSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'parent']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    supplier = SupplierSerializer(read_only=True)
    supplier_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'article', 'supplier', 'supplier_id', 'unit', 'category', 'category_id',
                  'origin', 'is_active', 'is_recommended', 'is_promotional', 
                  'base_price', 'markup_percent', 'final_price', 'created_at', 'updated_at']
        read_only_fields = ['final_price', 'created_at', 'updated_at']


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(required=False, allow_null=True)
    supplier_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ['name', 'article', 'supplier_id', 'unit', 'category_id', 'origin',
                  'is_active', 'is_recommended', 'is_promotional', 
                  'base_price', 'markup_percent']
