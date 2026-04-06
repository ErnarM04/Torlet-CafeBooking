from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions
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
