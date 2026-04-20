from django.core.exceptions import PermissionDenied, ValidationError
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema, extend_schema_view

from users.models import Customer

from .models import Booking
from .serializers import BookingCancelSerializer, BookingCreateSerializer, BookingSerializer
from .services import BookingService


@extend_schema_view(
    list=extend_schema(tags=['Bookings'], summary='List current user bookings'),
    retrieve=extend_schema(tags=['Bookings'], summary='Get booking details'),
    create=extend_schema(tags=['Bookings'], summary='Create a booking'),
)
class BookingViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer
    lookup_field = 'booking_id'
    lookup_value_regex = '[0-9a-f-]{36}'
    queryset = Booking.objects.none()

    def get_queryset(self):
        try:
            customer = self.request.user.customer_profile
        except Customer.DoesNotExist:
            return Booking.objects.none()

        return Booking.objects.select_related(
            'customer',
            'restaurant',
            'location',
            'table',
        ).filter(customer=customer)

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        if self.action == 'cancel':
            return BookingCancelSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            customer = request.user.customer_profile
        except Customer.DoesNotExist:
            return Response(
                {'detail': 'Customer profile not found.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        try:
            booking = BookingService.create_booking(
                customer=customer,
                restaurant=data.get('restaurant'),
                location=data['location'],
                table=data.get('table'),
                booking_date=data['booking_date'],
                booking_time=data['booking_time'],
                number_of_guests=data['number_of_guests'],
                duration_minutes=data['duration_minutes'],
                special_request=data.get('special_request', ''),
            )
        except ValidationError as exc:
            return Response({'detail': exc.messages}, status=status.HTTP_400_BAD_REQUEST)

        output = BookingSerializer(booking)
        return Response(output.data, status=status.HTTP_201_CREATED)

    @extend_schema(tags=['Bookings'], summary='Cancel a booking')
    @action(detail=True, methods=['post'])
    def cancel(self, request, booking_id=None):
        booking = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data.get('cancellation_reason', '')
        try:
            BookingService.cancel_booking(
                booking=booking,
                customer=request.user.customer_profile,
                reason=reason,
            )
        except PermissionDenied as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except ValidationError as exc:
            return Response({'detail': exc.messages}, status=status.HTTP_400_BAD_REQUEST)

        booking.refresh_from_db()
        return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Bookings'],
        summary='Check booking availability',
        parameters=[
            OpenApiParameter('location', OpenApiTypes.UUID, OpenApiParameter.QUERY, required=True),
            OpenApiParameter('booking_date', OpenApiTypes.DATE, OpenApiParameter.QUERY, required=True),
            OpenApiParameter('booking_time', OpenApiTypes.TIME, OpenApiParameter.QUERY, required=True),
            OpenApiParameter('number_of_guests', OpenApiTypes.INT, OpenApiParameter.QUERY, required=True),
            OpenApiParameter('duration_minutes', OpenApiTypes.INT, OpenApiParameter.QUERY),
        ],
    )
    @action(detail=False, methods=['get'])
    def availability(self, request):
        serializer = BookingCreateSerializer(
            data={
                'location': request.query_params.get('location'),
                'booking_date': request.query_params.get('booking_date'),
                'booking_time': request.query_params.get('booking_time'),
                'number_of_guests': request.query_params.get('number_of_guests'),
                'duration_minutes': request.query_params.get('duration_minutes', 120),
            }
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        availability = BookingService.check_availability(
            location=data['location'],
            booking_date=data['booking_date'],
            booking_time=data['booking_time'],
            number_of_guests=data['number_of_guests'],
            duration_minutes=data['duration_minutes'],
        )
        statuses = BookingService.table_statuses(
            location=data["location"],
            booking_date=data["booking_date"],
            booking_time=data["booking_time"],
            number_of_guests=data["number_of_guests"],
            duration_minutes=data["duration_minutes"],
        )

        return Response(
            {
                'is_available': availability['is_available'],
                'available_table_ids': [str(table.table_id) for table in availability['available_tables']],
                'table_statuses': statuses,
            }
        )
