from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Company, SavedCompany, SavedAddress, SavedRecipient, SubscriptionPlan, UserSubscription, UserCompany, ChatThread, ChatMessage, Notification, UserInvitation


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
    phone = serializers.CharField(required=False, allow_blank=True, label='Телефон', error_messages={'required': 'Поле "Телефон" не может быть пустым.'})
    address = serializers.CharField(required=False, allow_blank=True, label='Адрес', error_messages={'required': 'Поле "Адрес" не может быть пустым.'})
    
    class Meta:
        model = Company
        fields = ['name', 'phone', 'email', 'inn', 'address', 'contact_person']
        extra_kwargs = {
            'phone': {
                'label': 'Телефон',
                'error_messages': {'required': 'Поле "Телефон" не может быть пустым.'}
            },
            'address': {
                'label': 'Адрес',
                'error_messages': {'required': 'Поле "Адрес" не может быть пустым.'}
            },
        }


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
    company_name = serializers.CharField(write_only=True, required=False, label='Название компании')
    company_phone = serializers.CharField(write_only=True, required=False, label='Телефон')
    company_inn = serializers.CharField(write_only=True, required=False, label='ИНН')

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


class SavedCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedCompany
        fields = ['id', 'name', 'inn', 'bank', 'account', 'legal_address', 'is_default', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # Если это первая компания или установлен is_default, сбрасываем другие
        if validated_data.get('is_default', False):
            SavedCompany.objects.filter(user=validated_data['user']).update(is_default=False)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Если устанавливаем is_default, сбрасываем другие
        if validated_data.get('is_default', False):
            SavedCompany.objects.filter(user=instance.user).exclude(id=instance.id).update(is_default=False)
        return super().update(instance, validated_data)


class SavedAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedAddress
        fields = ['id', 'address', 'label', 'is_default', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # Если это первый адрес или установлен is_default, сбрасываем другие
        if validated_data.get('is_default', False):
            SavedAddress.objects.filter(user=validated_data['user']).update(is_default=False)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Если устанавливаем is_default, сбрасываем другие
        if validated_data.get('is_default', False):
            SavedAddress.objects.filter(user=instance.user).exclude(id=instance.id).update(is_default=False)
        return super().update(instance, validated_data)


class SavedRecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedRecipient
        fields = ['id', 'name', 'phone', 'is_default', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # Если это первый получатель или установлен is_default, сбрасываем другие
        if validated_data.get('is_default', False):
            SavedRecipient.objects.filter(user=validated_data['user']).update(is_default=False)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Если устанавливаем is_default, сбрасываем другие
        if validated_data.get('is_default', False):
            SavedRecipient.objects.filter(user=instance.user).exclude(id=instance.id).update(is_default=False)
        return super().update(instance, validated_data)


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'plan_type', 'name', 'price', 'description', 'max_companies', 
                  'additional_company_price', 'delivery_count', 'delivery_tracking_available',
                  'installment_available', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    plan_id = serializers.PrimaryKeyRelatedField(
        source='plan',
        queryset=SubscriptionPlan.objects.filter(is_active=True),
        write_only=True,
        required=True
    )
    is_active = serializers.SerializerMethodField()
    can_add_company = serializers.SerializerMethodField()
    has_delivery_available = serializers.SerializerMethodField()

    class Meta:
        model = UserSubscription
        fields = ['id', 'user', 'plan', 'plan_id', 'status', 'start_date', 'end_date',
                  'companies_count', 'delivery_count_used', 'installment_active',
                  'is_active', 'can_add_company', 'has_delivery_available',
                  'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at', 'is_active', 
                           'can_add_company', 'has_delivery_available', 'status', 'start_date', 'end_date']
        extra_kwargs = {
            'end_date': {'required': False}
        }

    def get_is_active(self, obj):
        return obj.is_active

    def get_can_add_company(self, obj):
        return obj.can_add_company

    def get_has_delivery_available(self, obj):
        return obj.has_delivery_available


class UserCompanySerializer(serializers.ModelSerializer):
    orders_count = serializers.IntegerField(read_only=True)
    installment_available = serializers.BooleanField(read_only=True)

    class Meta:
        model = UserCompany
        fields = ['id', 'name', 'inn', 'bank', 'account', 'legal_address', 'phone', 'email',
                  'orders_count', 'installment_available', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['orders_count', 'installment_available', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_role = serializers.CharField(source='sender.role', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'sender_name', 'sender_role', 'message', 'is_read', 'created_at']
        read_only_fields = ['sender', 'is_read', 'created_at']

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class ChatThreadSerializer(serializers.ModelSerializer):
    admin_name = serializers.CharField(source='admin.full_name', read_only=True)
    last_message = serializers.SerializerMethodField()
    last_message_at = serializers.SerializerMethodField()
    unread_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ChatThread
        fields = ['id', 'user', 'admin', 'admin_name', 'last_message', 'last_message_at', 'unread_count', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last_msg = obj.last_message
        return last_msg.message if last_msg else None

    def get_last_message_at(self, obj):
        last_msg = obj.last_message
        return last_msg.created_at if last_msg else None

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'type', 'is_read', 'created_at']
        read_only_fields = ['created_at']


class UserInvitationSerializer(serializers.ModelSerializer):
    invited_by_name = serializers.CharField(source='invited_by.full_name', read_only=True)

    class Meta:
        model = UserInvitation
        fields = ['id', 'email', 'role', 'invited_by', 'invited_by_name', 'token', 'accepted', 'accepted_at', 'created_at']
        read_only_fields = ['invited_by', 'token', 'accepted', 'accepted_at', 'created_at']
