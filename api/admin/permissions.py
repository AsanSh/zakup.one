"""
Permissions для админ API
"""
from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Разрешение только для администраторов
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin

