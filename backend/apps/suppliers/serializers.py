from rest_framework import serializers
from .models import Supplier, PriceList


class SupplierSerializer(serializers.ModelSerializer):
    price_lists_count = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = ['id', 'name', 'internal_code', 'contact_person', 'phone', 'email', 
                  'address', 'website', 'default_parsing_method', 'parsing_config', 
                  'markup_som', 'is_active', 'created_at', 'updated_at', 'price_lists_count', 'products_count']
        read_only_fields = ['created_at', 'updated_at']

    def get_price_lists_count(self, obj):
        return obj.price_lists.count()
    
    def get_products_count(self, obj):
        return obj.products.count()


class SupplierCreateUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    website = serializers.URLField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Supplier
        fields = ['name', 'internal_code', 'contact_person', 'phone', 'email', 
                  'address', 'website', 'default_parsing_method', 'parsing_config', 
                  'markup_som', 'is_active']

    def validate_email(self, value):
        if value == '':
            return None
        return value

    def validate_website(self, value):
        if value == '':
            return None
        return value


class PriceListSerializer(serializers.ModelSerializer):
    supplier = SupplierSerializer(read_only=True)
    supplier_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = PriceList
        fields = ['id', 'supplier', 'supplier_id', 'file', 'parsing_method', 'parsing_config',
                  'uploaded_at', 'processed_at', 'status', 'log', 'products_count']
        read_only_fields = ['uploaded_at', 'processed_at', 'status', 'log', 'products_count']

    def create(self, validated_data):
        supplier_id = validated_data.pop('supplier_id', None)
        if supplier_id:
            validated_data['supplier_id'] = supplier_id
        return super().create(validated_data)


class PriceListCreateSerializer(serializers.ModelSerializer):
    supplier_id = serializers.IntegerField()

    class Meta:
        model = PriceList
        fields = ['supplier_id', 'file', 'parsing_method', 'parsing_config']
