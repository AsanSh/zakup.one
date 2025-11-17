from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'company', 'is_active', 'is_verified', 'is_admin', 'created_at')
    list_filter = ('is_active', 'is_verified', 'is_admin', 'created_at')
    search_fields = ('email', 'full_name', 'company')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Персональная информация', {'fields': ('full_name', 'phone', 'company')}),
        ('Права доступа', {'fields': ('is_active', 'is_verified', 'is_admin', 'is_staff', 'is_superuser')}),
        ('Даты', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'company', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'last_login')

