from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


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
