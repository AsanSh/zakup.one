"""
Serializers для аутентификации
"""
from rest_framework import serializers
from users.models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer для пользователя"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'company', 'is_verified', 'is_admin']
        read_only_fields = ['id', 'is_verified', 'is_admin']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer для создания пользователя"""
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['email', 'full_name', 'phone', 'company', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user

