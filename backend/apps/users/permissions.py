from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    """
    Разрешение для проверки роли ADMIN вместо is_staff
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'role') and
            request.user.role == 'ADMIN'
        )



