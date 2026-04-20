from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions
from django.conf import settings
from django.core.cache import cache
from django.utils.crypto import get_random_string
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from .serializers import (
    PhoneTokenObtainPairSerializer,
    RegisterSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
)

@extend_schema(tags=['Auth'], summary='Login and get JWT token pair')
class PhoneTokenObtainPairView(TokenObtainPairView):
    serializer_class = PhoneTokenObtainPairSerializer

class TestProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Auth'],
        summary='Test protected endpoint',
        responses=inline_serializer(
            name='TestProtectedResponse',
            fields={
                'message': serializers.CharField(),
                'user': serializers.CharField(),
            },
        ),
    )
    def get(self, request):
        return Response({
            "message": "JWT works",
            "user": request.user.phone_number
        })
    
@extend_schema(tags=['Auth'], summary='Register new user account')
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        phone = request.data.get("phone_number")
        if not phone:
            return Response({"phone_number": ["Phone number is required."]}, status=400)

        verified_key = f"sms_verified:{phone}"
        if not cache.get(verified_key):
            return Response(
                {"detail": "Phone number is not verified. Please verify via SMS code first."},
                status=400,
            )

        return super().create(request, *args, **kwargs)


class SmsSendSerializer(serializers.Serializer):
    phone_number = serializers.CharField()


class SmsVerifySerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    code = serializers.CharField(max_length=6)


@extend_schema(tags=["Auth"], summary="Send SMS verification code", request=SmsSendSerializer)
class SmsSendView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = SmsSendSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        phone = ser.validated_data["phone_number"]

        # 6-digit numeric code
        code = get_random_string(6, allowed_chars="0123456789")
        cache.set(f"sms_code:{phone}", code, timeout=getattr(settings, "SMS_CODE_TTL_SECONDS", 300))

        # Demo behavior: return the code when DEBUG to make local testing possible.
        payload = {"sent": True}
        if getattr(settings, "DEBUG", False):
            payload["dev_code"] = code
        return Response(payload)


@extend_schema(tags=["Auth"], summary="Verify SMS code", request=SmsVerifySerializer)
class SmsVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = SmsVerifySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        phone = ser.validated_data["phone_number"]
        code = ser.validated_data["code"]

        stored = cache.get(f"sms_code:{phone}")
        if not stored or stored != code:
            return Response({"detail": "Invalid or expired code."}, status=400)

        cache.delete(f"sms_code:{phone}")
        cache.set(
            f"sms_verified:{phone}",
            True,
            timeout=getattr(settings, "SMS_VERIFIED_TTL_SECONDS", 600),
        )
        return Response({"verified": True})

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=['Auth'], summary='Get current user profile', responses=ProfileSerializer)
    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(tags=['Auth'], summary='Update current user profile', request=ProfileUpdateSerializer, responses=ProfileSerializer)
    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ProfileSerializer(request.user).data)
