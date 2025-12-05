from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Company


class CompanySerializer(serializers.ModelSerializer):
    users_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ['id', 'name', 'phone', 'email', 'inn', 'address', 'contact_person',
                  'approved', 'approved_at', 'approved_by', 'rejection_reason',
                  'created_at', 'updated_at', 'users_count']
        read_only_fields = ['approved_at', 'approved_by', 'created_at', 'updated_at']

    def get_users_count(self, obj):
        return obj.users.count()


class CompanyCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['name', 'phone', 'email', 'inn', 'address', 'contact_person']


class CompanyApproveSerializer(serializers.Serializer):
    approved = serializers.BooleanField()
    rejection_reason = serializers.CharField(required=False, allow_blank=True)


class UserSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'company', 'company_id', 'is_active', 'email_verified', 'date_joined']
        read_only_fields = ['date_joined', 'email_verified']


class UserCreateUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    company_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'full_name', 'role', 'company_id', 'is_active']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if password:
            user = User.objects.create_user(password=password, **validated_data)
        else:
            user = User.objects.create(**validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)


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
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            company_name = validated_data.pop('company_name', None)
            company_phone = validated_data.pop('company_phone', None)
            company_inn = validated_data.pop('company_inn', None)
            validated_data.pop('password_confirm')
            
            # Очищаем пустые строки
            if company_name == '' or company_name is None:
                company_name = None
            if company_phone == '' or company_phone is None:
                company_phone = None
            if company_inn == '' or company_inn is None:
                company_inn = None
            
            logger.info(f'Creating user with email: {validated_data.get("email")}, company_name: {company_name}')
            
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
                logger.info(f'Company created for user {user.email}: {company.name}')
            
            logger.info(f'User created successfully: {user.email}')
            return user
        except Exception as e:
            logger.error(f'Error in RegisterSerializer.create: {str(e)}', exc_info=True)
            raise
