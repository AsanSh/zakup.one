"""
Serializers для пользователей
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор пользователя"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'company', 
                  'is_verified', 'is_admin', 'is_active']
        read_only_fields = ['id', 'is_verified', 'is_admin']


class UserCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания пользователя"""
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['email', 'full_name', 'phone', 'company', 'password']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Кастомный сериализатор для JWT токенов с данными пользователя"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['user_id'] = user.id
        token['email'] = user.email
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Проверяем что пользователь активен
        if not self.user.is_active:
            raise serializers.ValidationError("Аккаунт деактивирован")
        
        # Админы могут входить без верификации
        if not self.user.is_admin and not self.user.is_verified:
            raise serializers.ValidationError("Аккаунт не верифицирован администратором")
        
        # Добавляем данные пользователя в ответ
        data['user'] = UserSerializer(self.user).data
        
        return data

