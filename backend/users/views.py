from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from django.db.models import Q
from .models import User
from .serializers import (
    PhoneTokenObtainPairSerializer,
    RegisterSerializer,
    ProfileSerializer,
    RestaurantStaffCreateSerializer,
    RestaurantStaffSerializer,
    UserAdminListSerializer,
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


@extend_schema(tags=['Staff'], summary='Promote user to restaurant staff')
class PromoteRestaurantStaffView(generics.CreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = RestaurantStaffCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        staff = serializer.save()
        output = RestaurantStaffSerializer(staff)
        return Response(output.data, status=201)


@extend_schema(tags=['Staff'], summary='List users for admin operations')
class UserAdminListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserAdminListSerializer

    def get_queryset(self):
        qs = User.objects.all().order_by('-date_joined')
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(phone_number__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
            )
        return qs
