from django.contrib import admin
from .models import Supplier, PriceList


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'internal_code', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'internal_code')


@admin.register(PriceList)
class PriceListAdmin(admin.ModelAdmin):
    list_display = ('supplier', 'uploaded_at', 'status')
    list_filter = ('status', 'uploaded_at')
    search_fields = ('supplier__name',)



