from rest_framework import serializers
from .models import Product, Category
from apps.suppliers.serializers import SupplierSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'parent']


class ProductSerializer(serializers.ModelSerializer):
    """Базовый сериализатор товара - используется для клиентов (показывает final_price)"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    supplier = SupplierSerializer(read_only=True)
    supplier_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    # Для клиентов показываем final_price как price
    price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'article', 'supplier', 'supplier_id', 'unit', 'category', 'category_id',
                  'origin', 'is_active', 'is_recommended', 'is_promotional', 
                  'price', 'created_at', 'updated_at']
        read_only_fields = ['price', 'created_at', 'updated_at']
    
    def get_price(self, obj):
        """Возвращает final_price (цена с наценкой) для клиентов"""
        return float(obj.final_price) if obj.final_price else 0.0


class ProductAdminSerializer(serializers.ModelSerializer):
    """Сериализатор товара для админа (показывает base_price - цена поставщика)"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    supplier = SupplierSerializer(read_only=True)
    supplier_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    # Для админа показываем base_price как price (цена поставщика)
    price = serializers.SerializerMethodField()
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'article', 'supplier', 'supplier_id', 'unit', 'category', 'category_id',
                  'origin', 'is_active', 'is_recommended', 'is_promotional', 
                  'base_price', 'markup_percent', 'price', 'final_price', 'created_at', 'updated_at']
        read_only_fields = ['final_price', 'created_at', 'updated_at']
    
    def get_price(self, obj):
        """Возвращает base_price (цена поставщика) для админа"""
        return float(obj.base_price) if obj.base_price else 0.0


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(required=False, allow_null=True)
    supplier_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ['name', 'article', 'supplier_id', 'unit', 'category_id', 'origin',
                  'is_active', 'is_recommended', 'is_promotional', 
                  'base_price', 'markup_percent']
