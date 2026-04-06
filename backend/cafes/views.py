from datetime import datetime

from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema, extend_schema_view
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from bookings.services import BookingService
from users.permissions import IsStaffOrReadOnly, is_staff_user

from .models import Location, Restaurant, Table, TimeSlot
from .serializers import (
    LocationCreateSerializer,
    LocationDetailSerializer,
    LocationListSerializer,
    RestaurantCreateSerializer,
    RestaurantDetailSerializer,
    RestaurantListSerializer,
    TableCreateSerializer,
    TableSerializer,
    TimeSlotCreateSerializer,
    TimeSlotSerializer,
)


class SoftDeactivateMixin:
    """Staff destroy = set is_active=False (guests no longer see the row)."""

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])


@extend_schema_view(
    list=extend_schema(tags=['Restaurants'], summary='List restaurants'),
    retrieve=extend_schema(tags=['Restaurants'], summary='Get restaurant details'),
    create=extend_schema(tags=['Restaurants'], summary='Create restaurant'),
    update=extend_schema(tags=['Restaurants'], summary='Update restaurant'),
    partial_update=extend_schema(tags=['Restaurants'], summary='Partial update restaurant'),
    destroy=extend_schema(tags=['Restaurants'], summary='Deactivate restaurant'),
)
class RestaurantViewSet(SoftDeactivateMixin, viewsets.ModelViewSet):
    queryset = Restaurant.objects.all()
    permission_classes = [IsStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'cuisine_type', 'is_active']
    search_fields = ['name', 'description', 'cuisine_type']
    ordering_fields = ['rating', 'created_at', 'name']
    ordering = ['-rating']
    lookup_field = 'restaurant_id'
    lookup_value_regex = '[0-9a-f-]{36}'

    def get_queryset(self):
        qs = Restaurant.objects.all()
        if not is_staff_user(getattr(self.request, 'user', None)):
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return RestaurantCreateSerializer
        if self.action == 'retrieve':
            return RestaurantDetailSerializer
        return RestaurantListSerializer

    @extend_schema(tags=['Restaurants'], summary='List locations of a restaurant')
    @action(detail=True, methods=['get'])
    def locations(self, request, restaurant_id=None):
        restaurant = self.get_object()
        locs = restaurant.locations.all()
        if not is_staff_user(request.user):
            locs = locs.filter(is_active=True)
        serializer = LocationListSerializer(locs, many=True)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(tags=['Locations'], summary='List locations'),
    retrieve=extend_schema(tags=['Locations'], summary='Get location details'),
    create=extend_schema(tags=['Locations'], summary='Create location'),
    update=extend_schema(tags=['Locations'], summary='Update location'),
    partial_update=extend_schema(tags=['Locations'], summary='Partial update location'),
    destroy=extend_schema(tags=['Locations'], summary='Deactivate location'),
)
class LocationViewSet(SoftDeactivateMixin, viewsets.ModelViewSet):
    queryset = Location.objects.all().select_related('restaurant')
    permission_classes = [IsStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['city', 'restaurant', 'is_active']
    search_fields = ['address', 'restaurant__name']
    lookup_field = 'location_id'
    lookup_value_regex = '[0-9a-f-]{36}'

    def get_queryset(self):
        qs = Location.objects.all().select_related('restaurant')
        if not is_staff_user(getattr(self.request, 'user', None)):
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return LocationCreateSerializer
        if self.action == 'retrieve':
            return LocationDetailSerializer
        return LocationListSerializer

    @extend_schema(
        tags=['Locations'],
        summary='List tables in location',
        parameters=[
            OpenApiParameter('table_type', OpenApiTypes.STR, OpenApiParameter.QUERY),
            OpenApiParameter('min_capacity', OpenApiTypes.INT, OpenApiParameter.QUERY),
            OpenApiParameter('max_capacity', OpenApiTypes.INT, OpenApiParameter.QUERY),
        ],
    )
    @action(detail=True, methods=['get'])
    def tables(self, request, location_id=None):
        location = self.get_object()
        tables = location.tables.all()
        if not is_staff_user(request.user):
            tables = tables.filter(is_active=True)

        table_type = request.query_params.get('table_type')
        min_capacity = request.query_params.get('min_capacity')
        max_capacity = request.query_params.get('max_capacity')

        if table_type:
            tables = tables.filter(table_type=table_type)
        if min_capacity:
            tables = tables.filter(max_guests__gte=int(min_capacity))
        if max_capacity:
            tables = tables.filter(min_guests__lte=int(max_capacity))

        serializer = TableSerializer(tables, many=True)
        return Response(serializer.data)

    @extend_schema(tags=['Locations'], summary='List time slots in location')
    @action(detail=True, methods=['get'])
    def time_slots(self, request, location_id=None):
        location = self.get_object()
        slots = location.time_slots.all()
        if not is_staff_user(request.user):
            slots = slots.filter(is_active=True)
        serializer = TimeSlotSerializer(slots, many=True)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(tags=['Tables'], summary='List tables'),
    retrieve=extend_schema(tags=['Tables'], summary='Get table details'),
    create=extend_schema(tags=['Tables'], summary='Create table'),
    update=extend_schema(tags=['Tables'], summary='Update table'),
    partial_update=extend_schema(tags=['Tables'], summary='Partial update table'),
    destroy=extend_schema(tags=['Tables'], summary='Deactivate table'),
)
class TableViewSet(SoftDeactivateMixin, viewsets.ModelViewSet):
    queryset = Table.objects.all().select_related('location', 'location__restaurant')
    permission_classes = [IsStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['location', 'table_type', 'is_available', 'is_active']
    lookup_field = 'table_id'
    lookup_value_regex = '[0-9a-f-]{36}'

    def get_queryset(self):
        qs = Table.objects.all().select_related('location', 'location__restaurant')
        if not is_staff_user(getattr(self.request, 'user', None)):
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return TableCreateSerializer
        return TableSerializer

    @extend_schema(
        tags=['Tables'],
        summary='Check table availability',
        parameters=[
            OpenApiParameter('date', OpenApiTypes.DATE, OpenApiParameter.QUERY, required=True),
            OpenApiParameter('time', OpenApiTypes.TIME, OpenApiParameter.QUERY, required=True),
            OpenApiParameter('duration', OpenApiTypes.INT, OpenApiParameter.QUERY),
        ],
    )
    @action(detail=True, methods=['get'])
    def availability(self, request, table_id=None):
        table = self.get_object()
        date_str = request.query_params.get('date')
        time_str = request.query_params.get('time')
        duration = int(request.query_params.get('duration', 120))

        if not date_str or not time_str:
            return Response(
                {'detail': 'Both `date` and `time` query params are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            booking_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            booking_time = datetime.strptime(time_str, '%H:%M').time()
        except ValueError:
            return Response(
                {'detail': 'Invalid date/time format. Use date=YYYY-MM-DD and time=HH:MM.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        has_conflict = BookingService.has_conflict(
            location=table.location,
            booking_date=booking_date,
            booking_time=booking_time,
            duration_minutes=duration,
            table=table,
        )

        return Response(
            {
                'table_id': str(table.table_id),
                'table_number': table.table_number,
                'date': date_str,
                'time': time_str,
                'duration_minutes': duration,
                'is_available': not has_conflict,
            }
        )


@extend_schema_view(
    list=extend_schema(tags=['Time Slots'], summary='List time slots'),
    retrieve=extend_schema(tags=['Time Slots'], summary='Get time slot details'),
    create=extend_schema(tags=['Time Slots'], summary='Create time slot'),
    update=extend_schema(tags=['Time Slots'], summary='Update time slot'),
    partial_update=extend_schema(tags=['Time Slots'], summary='Partial update time slot'),
    destroy=extend_schema(tags=['Time Slots'], summary='Deactivate time slot'),
)
class TimeSlotViewSet(SoftDeactivateMixin, viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all().select_related('location')
    permission_classes = [IsStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['location', 'is_active']
    lookup_field = 'time_slot_id'
    lookup_value_regex = '[0-9a-f-]{36}'

    def get_queryset(self):
        qs = TimeSlot.objects.all().select_related('location')
        if not is_staff_user(getattr(self.request, 'user', None)):
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return TimeSlotCreateSerializer
        return TimeSlotSerializer
