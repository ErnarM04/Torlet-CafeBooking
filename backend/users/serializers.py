from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import RestaurantStaff, User


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
            'email': user.email or '',
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
    is_restaurant_staff = serializers.SerializerMethodField()
    staff_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'user_id',
            'phone_number',
            'first_name',
            'last_name',
            'email',
            'is_staff',
            'is_restaurant_staff',
            'staff_id',
        )
        read_only_fields = (
            'user_id',
            'phone_number',
            'is_staff',
            'is_restaurant_staff',
            'staff_id',
        )

    def get_is_restaurant_staff(self, obj):
        return RestaurantStaff.objects.filter(pk=obj.pk).exists()

    def get_staff_id(self, obj):
        sid = RestaurantStaff.objects.filter(user=obj).values_list(
            'staff_id', flat=True
        ).first()
        return str(sid) if sid else None


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email')
