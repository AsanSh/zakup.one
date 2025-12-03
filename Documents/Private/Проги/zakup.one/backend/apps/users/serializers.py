from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Company


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'phone', 'inn', 'approved']


class UserSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'company', 'is_active']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    company_name = serializers.CharField(write_only=True, required=False)
    company_phone = serializers.CharField(write_only=True, required=False)
    company_inn = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'full_name', 'company_name', 'company_phone', 'company_inn']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'Пароли не совпадают'})
        return attrs

    def create(self, validated_data):
        company_name = validated_data.pop('company_name', None)
        company_phone = validated_data.pop('company_phone', None)
        company_inn = validated_data.pop('company_inn', None)
        validated_data.pop('password_confirm')
        
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        
        if company_name:
            company = Company.objects.create(
                name=company_name,
                phone=company_phone or '',
                inn=company_inn or '',
                approved=False
            )
            user.company = company
            user.save()
        
        return user



