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
    
    username_field = 'email'  # Используем email вместо username
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Заменяем поле username на email
        if 'username' in self.fields:
            self.fields['email'] = self.fields.pop('username')
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['user_id'] = user.id
        token['email'] = user.email
        return token
    
    def validate(self, attrs):
        # Получаем email из attrs
        email = attrs.get('email') or attrs.get('username')
        
        if not email:
            raise serializers.ValidationError("Email обязателен")
        
        # Преобразуем в username для базового валидатора Django
        attrs['username'] = email
        # Удаляем email если есть, чтобы не было конфликта
        if 'email' in attrs:
            del attrs['email']
        
        try:
            # Вызываем базовый validate который найдет пользователя по username (email)
            data = super().validate(attrs)
        except Exception as e:
            # Преобразуем ошибки в понятный формат
            error_msg = str(e)
            if 'No active account found' in error_msg or 'Unable to log in' in error_msg:
                raise serializers.ValidationError("Неверный email или пароль")
            # Пробрасываем другие ошибки дальше
            raise
        
        # Проверяем что пользователь активен
        if not self.user.is_active:
            raise serializers.ValidationError("Аккаунт деактивирован")
        
        # Админы могут входить без верификации
        if not self.user.is_admin and not self.user.is_verified:
            raise serializers.ValidationError("Аккаунт не верифицирован администратором")
        
        # Добавляем данные пользователя в ответ
        data['user'] = UserSerializer(self.user).data
        
        # Добавляем access_token для совместимости с frontend (DRF Simple JWT возвращает 'access')
        if 'access' in data and 'access_token' not in data:
            data['access_token'] = data['access']
        
        return data
