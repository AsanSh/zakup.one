"""
API views для админ-панели
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse, FileResponse
from products.models import Supplier, Product
from users.models import User
from orders.models import Order
from price_lists.models import PriceListUpdate
from .permissions import IsAdminUser
import os
from pathlib import Path
from datetime import datetime
import pandas as pd

# TODO: Перенести логику импорта прайс-листов из app/services/price_import.py


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def suppliers_view(request):
    """
    GET: Получить список поставщиков
    POST: Создать нового поставщика
    """
    if request.method == 'GET':
        suppliers = Supplier.objects.all()
        result = []
        for supplier in suppliers:
            last_update = PriceListUpdate.objects.filter(
                supplier=supplier
            ).order_by('-last_update').first()
            
            result.append({
                'id': supplier.id,
                'name': supplier.name,
                'contact_email': supplier.contact_email or '',
                'contact_phone': supplier.contact_phone or '',
                'is_active': supplier.is_active,
                'default_header_row': last_update.header_row if last_update else (supplier.default_header_row or 7),
                'default_start_row': last_update.start_row if last_update else (supplier.default_start_row or 8),
            })
        return Response(result)
    else:  # POST
        name = request.data.get('name')
        if not name:
            return Response({'detail': 'Имя поставщика обязательно'}, status=status.HTTP_400_BAD_REQUEST)
        
        if Supplier.objects.filter(name=name).exists():
            return Response({'detail': 'Поставщик с таким именем уже существует'}, status=status.HTTP_400_BAD_REQUEST)
        
        supplier = Supplier.objects.create(
            name=name,
            contact_email=request.data.get('contact_email', ''),
            contact_phone=request.data.get('contact_phone', ''),
        )
        
        return Response({
            'id': supplier.id,
            'name': supplier.name,
            'contact_email': supplier.contact_email or '',
            'contact_phone': supplier.contact_phone or '',
            'is_active': supplier.is_active,
            'default_header_row': supplier.default_header_row or 7,
            'default_start_row': supplier.default_start_row or 8,
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_supplier(request):
    """
    Создать нового поставщика
    POST /api/v1/admin/suppliers
    """
    name = request.data.get('name')
    if not name:
        return Response({'detail': 'Имя поставщика обязательно'}, status=status.HTTP_400_BAD_REQUEST)
    
    if Supplier.objects.filter(name=name).exists():
        return Response({'detail': 'Поставщик с таким именем уже существует'}, status=status.HTTP_400_BAD_REQUEST)
    
    supplier = Supplier.objects.create(
        name=name,
        contact_email=request.data.get('contact_email', ''),
        contact_phone=request.data.get('contact_phone', ''),
    )
    
    return Response({
        'id': supplier.id,
        'name': supplier.name,
        'contact_email': supplier.contact_email or '',
        'contact_phone': supplier.contact_phone or '',
        'is_active': supplier.is_active,
        'default_header_row': supplier.default_header_row or 7,
        'default_start_row': supplier.default_start_row or 8,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def import_price_list(request):
    """
    Загрузка и импорт прайс-листа
    POST /api/v1/admin/import-price-list
    """
    # TODO: Реализовать полную логику импорта из app/services/price_import.py
    return Response({
        'detail': 'Импорт прайс-листов будет реализован в следующей версии',
        'supplier_name': '',
        'import_date': datetime.now().isoformat(),
        'imported': 0,
        'updated': 0,
        'deactivated': 0,
        'total_processed': 0,
        'total_products': 0,
        'errors': []
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_users(request):
    """
    Получить список пользователей
    GET /api/v1/admin/users
    """
    users = User.objects.all().order_by('-created_at')
    result = []
    for user in users:
        result.append({
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'phone': user.phone or '',
            'company': user.company,
            'is_active': user.is_active,
            'is_verified': user.is_verified,
            'is_admin': user.is_admin,
            'created_at': user.created_at.isoformat() if user.created_at else None,
        })
    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_orders_admin(request):
    """
    Получить список всех заявок (для админа)
    GET /api/v1/admin/orders
    """
    orders = Order.objects.all().order_by('-created_at')
    result = []
    for order in orders:
        result.append({
            'id': order.id,
            'user_email': order.user.email,
            'status': order.status,
            'delivery_address': order.delivery_address,
            'created_at': order.created_at.isoformat() if order.created_at else None,
        })
    return Response(result)

