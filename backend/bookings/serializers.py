from datetime import datetime

from django.utils import timezone
from rest_framework import serializers

from cafes.models import Location, Restaurant, Table

from .models import Booking
from .models import BookingComment


class BookingSerializer(serializers.ModelSerializer):
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


class BookingCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingComment
        fields = (
            'comment_id',
            'booking',
            'staff',
            'comment',
            'created_at',
            'is_visible_to_customer',
        )
        read_only_fields = (
            'comment_id',
            'staff',
            'created_at',
        )
