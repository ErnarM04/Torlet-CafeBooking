from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from cafes.models import Restaurant
from .models import User
from .models import RestaurantStaff


class PhoneTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'phone_number'

    def validate(self, attrs):
        phone_number = attrs.get('phone_number')
        password = attrs.get('password')

        if phone_number and password:
            user = authenticate(
                request=self.context.get('request'),
                phone_number=phone_number,
                password=password
            )
        else:
            raise serializers.ValidationError('Phone number and password required')

        if not user:
            raise serializers.ValidationError('Invalid phone number or password')

        data = super().validate(attrs)
        data['user'] = {
            'id': user.id,
            'phone_number': user.phone_number,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            'phone_number',
            'password',
            'first_name',
            'last_name',
            'email',
        )

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user
    
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'phone_number',
            'first_name',
            'last_name',
            'email',
        )


class RestaurantStaffCreateSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    restaurant_id = serializers.UUIDField()
    position = serializers.ChoiceField(choices=RestaurantStaff.POSITION_CHOICES, default='waiter')
    hire_date = serializers.DateField(required=False, allow_null=True)
    is_active = serializers.BooleanField(default=True)

    def validate(self, attrs):
        try:
            user = User.objects.get(user_id=attrs['user_id'])
        except User.DoesNotExist as exc:
            raise serializers.ValidationError({'user_id': 'User not found.'}) from exc

        try:
            restaurant = Restaurant.objects.get(restaurant_id=attrs['restaurant_id'])
        except Restaurant.DoesNotExist as exc:
            raise serializers.ValidationError({'restaurant_id': 'Restaurant not found.'}) from exc

        if hasattr(user, 'staff_profile'):
            raise serializers.ValidationError({'user_id': 'This user is already staff.'})

        attrs['user'] = user
        attrs['restaurant'] = restaurant
        return attrs

    def create(self, validated_data):
        staff = RestaurantStaff.objects.create(
            user=validated_data['user'],
            restaurant=validated_data['restaurant'],
            position=validated_data.get('position', 'waiter'),
            hire_date=validated_data.get('hire_date'),
            is_active=validated_data.get('is_active', True),
        )
        return staff


class RestaurantStaffSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(source='user.user_id', read_only=True)
    restaurant_id = serializers.UUIDField(source='restaurant.restaurant_id', read_only=True)

    class Meta:
        model = RestaurantStaff
        fields = (
            'staff_id',
            'user_id',
            'restaurant_id',
            'position',
            'hire_date',
            'is_active',
            'created_at',
        )


class UserAdminListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'user_id',
            'phone_number',
            'first_name',
            'last_name',
            'email',
            'is_staff',
            'is_superuser',
            'is_active',
            'date_joined',
        )
