from rest_framework import serializers
from .models import Supplier, PriceList


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'internal_code', 'is_active']


class PriceListSerializer(serializers.ModelSerializer):
    supplier = SupplierSerializer(read_only=True)

    class Meta:
        model = PriceList
        fields = ['id', 'supplier', 'file', 'uploaded_at', 'status', 'log']



