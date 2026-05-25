from datetime import datetime

from django.utils import timezone
from rest_framework import serializers

from cafes.models import Location, Restaurant, Table
from users.models import Customer

from .models import Booking, BookingEventLog, BookingNotification


class BookingEventLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = BookingEventLog
        fields = (
            'event_id',
            'booking',
            'actor',
            'actor_name',
            'action',
            'message',
            'created_at',
        )
        read_only_fields = fields

    def get_actor_name(self, obj):
        if not obj.actor:
            return 'System'
        name = f"{obj.actor.first_name} {obj.actor.last_name}".strip()
        return name or obj.actor.phone_number


class BookingNotificationSerializer(serializers.ModelSerializer):
    booking_number = serializers.CharField(source='booking.booking_number', read_only=True)

    class Meta:
        model = BookingNotification
        fields = (
            'notification_id',
            'booking',
            'booking_number',
            'kind',
            'title',
            'message',
            'is_read',
            'created_at',
        )
        read_only_fields = fields


class BookingSerializer(serializers.ModelSerializer):
    event_logs = BookingEventLogSerializer(many=True, read_only=True)

    class Meta:
        model = Booking
        fields = (
            'booking_id',
            'booking_number',
            'customer',
            'restaurant',
            'location',
            'table',
            'booking_date',
            'booking_time',
            'number_of_guests',
            'duration_minutes',
            'status',
            'special_request',
            'created_at',
            'confirmed_at',
            'cancelled_at',
            'completed_at',
            'updated_at',
            'cancellation_reason',
            'event_logs',
        )
        read_only_fields = (
            'booking_id',
            'booking_number',
            'customer',
            'status',
            'created_at',
            'confirmed_at',
            'cancelled_at',
            'completed_at',
            'updated_at',
            'cancellation_reason',
            'event_logs',
        )


class BookingCreateSerializer(serializers.Serializer):
    restaurant = serializers.PrimaryKeyRelatedField(
        queryset=Restaurant.objects.filter(is_active=True),
        required=False,
    )
    location = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.filter(is_active=True),
    )
    table = serializers.PrimaryKeyRelatedField(
        queryset=Table.objects.filter(is_active=True, is_available=True),
        required=False,
        allow_null=True,
    )
    booking_date = serializers.DateField()
    booking_time = serializers.TimeField(
        input_formats=[
            '%H:%M',
            '%H:%M:%S',
            '%H:%M:%S.%f',
            '%H:%M:%S.%fZ',
            '%H:%M:%SZ',
        ],
        help_text='Accepted: HH:MM, HH:MM:SS, HH:MM:SS.sss or HH:MM:SS.sssZ',
    )
    number_of_guests = serializers.IntegerField(min_value=1)
    duration_minutes = serializers.IntegerField(min_value=30, default=120)
    special_request = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        location = attrs['location']
        restaurant = attrs.get('restaurant')
        table = attrs.get('table')
        booking_date = attrs['booking_date']
        booking_time = attrs['booking_time']

        booking_dt = datetime.combine(booking_date, booking_time)
        now_naive = timezone.localtime().replace(tzinfo=None)
        if booking_dt <= now_naive:
            raise serializers.ValidationError('Booking datetime must be in the future.')

        if restaurant and restaurant.restaurant_id != location.restaurant_id:
            raise serializers.ValidationError('Location does not belong to selected restaurant.')

        if table and table.location_id != location.location_id:
            raise serializers.ValidationError('Table does not belong to selected location.')

        return attrs


class BookingCancelSerializer(serializers.Serializer):
    cancellation_reason = serializers.CharField(required=False, allow_blank=True, max_length=1000)


class StaffBookingSerializer(serializers.ModelSerializer):
    event_logs = BookingEventLogSerializer(many=True, read_only=True)
    customer_phone = serializers.CharField(
        source="customer.user.phone_number", read_only=True
    )
    customer_first_name = serializers.CharField(
        source="customer.user.first_name", read_only=True
    )
    customer_last_name = serializers.CharField(
        source="customer.user.last_name", read_only=True
    )
    restaurant_name = serializers.CharField(source="restaurant.name", read_only=True)
    location_address = serializers.CharField(source="location.address", read_only=True)
    table_number = serializers.CharField(
        source="table.table_number", read_only=True, allow_null=True
    )

    class Meta:
        model = Booking
        fields = (
            "booking_id",
            "booking_number",
            "customer",
            "customer_phone",
            "customer_first_name",
            "customer_last_name",
            "restaurant",
            "restaurant_name",
            "location",
            "location_address",
            "table",
            "table_number",
            "booking_date",
            "booking_time",
            "number_of_guests",
            "duration_minutes",
            "status",
            "special_request",
            "created_at",
            "confirmed_at",
            "cancelled_at",
            "completed_at",
            "updated_at",
            "cancellation_reason",
            "assigned_by",
            "event_logs",
        )
        read_only_fields = fields


class StaffCustomerSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source="user.phone_number", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Customer
        fields = (
            "user",
            "phone_number",
            "first_name",
            "last_name",
            "email",
            "customer_id",
            "total_bookings",
            "cancelled_bookings",
            "no_show_count",
            "loyalty_points",
            "preferences",
            "created_at",
        )
        read_only_fields = (
            "user",
            "phone_number",
            "first_name",
            "last_name",
            "email",
            "customer_id",
            "total_bookings",
            "cancelled_bookings",
            "no_show_count",
            "loyalty_points",
            "preferences",
            "created_at",
        )


class StaffCustomerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ("loyalty_points", "preferences")
