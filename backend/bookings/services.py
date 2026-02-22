from datetime import datetime, timedelta

from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.db.models import F

from cafes.models import Location, Restaurant, Table
from users.models import Customer

from .models import Booking


class BookingService:
    @staticmethod
    def _booking_window(booking_date, booking_time, duration_minutes):
        start = datetime.combine(booking_date, booking_time)
        end = start + timedelta(minutes=duration_minutes)
        return start, end

    @classmethod
    def has_conflict(
        cls,
        *,
        location,
        booking_date,
        booking_time,
        duration_minutes,
        table=None,
        exclude_booking=None,
    ):
        requested_start, requested_end = cls._booking_window(
            booking_date,
            booking_time,
            duration_minutes,
        )
        date_from = booking_date - timedelta(days=1)
        date_to = booking_date + timedelta(days=1)

        candidates = Booking.objects.filter(
            location=location,
            status__in=Booking.ACTIVE_STATUSES,
            booking_date__range=(date_from, date_to),
        )
        if table is not None:
            candidates = candidates.filter(table=table)
        if exclude_booking is not None:
            candidates = candidates.exclude(pk=getattr(exclude_booking, 'pk', exclude_booking))

        for booking in candidates:
            existing_start, existing_end = cls._booking_window(
                booking.booking_date,
                booking.booking_time,
                booking.duration_minutes,
            )
            if requested_start < existing_end and existing_start < requested_end:
                return True
        return False

    @classmethod
    def get_available_tables(
        cls,
        *,
        location,
        booking_date,
        booking_time,
        number_of_guests,
        duration_minutes=120,
    ):
        tables = Table.objects.filter(
            location=location,
            is_active=True,
            is_available=True,
            min_guests__lte=number_of_guests,
            max_guests__gte=number_of_guests,
        ).order_by('max_guests', 'table_number')

        return [
            table for table in tables
            if not cls.has_conflict(
                location=location,
                booking_date=booking_date,
                booking_time=booking_time,
                duration_minutes=duration_minutes,
                table=table,
            )
        ]

    @classmethod
    def check_availability(
        cls,
        *,
        location,
        booking_date,
        booking_time,
        number_of_guests,
        duration_minutes=120,
    ):
        available_tables = cls.get_available_tables(
            location=location,
            booking_date=booking_date,
            booking_time=booking_time,
            number_of_guests=number_of_guests,
            duration_minutes=duration_minutes,
        )
        return {
            'is_available': bool(available_tables),
            'available_tables': available_tables,
        }

    @classmethod
    @transaction.atomic
    def create_booking(
        cls,
        *,
        customer,
        location,
        booking_date,
        booking_time,
        number_of_guests,
        restaurant=None,
        table=None,
        duration_minutes=120,
        special_request='',
        status='pending',
    ):
        if number_of_guests < 1:
            raise ValidationError('number_of_guests must be greater than 0.')

        if restaurant is None:
            restaurant = location.restaurant
        elif location.restaurant_id != restaurant.restaurant_id:
            raise ValidationError('Location does not belong to the selected restaurant.')

        if table is not None:
            if table.location_id != location.location_id:
                raise ValidationError('Table does not belong to the selected location.')
            if not table.is_active or not table.is_available:
                raise ValidationError('Selected table is not available.')
            if not table.check_capacity(number_of_guests):
                raise ValidationError('Selected table does not fit the guest count.')
            if cls.has_conflict(
                location=location,
                booking_date=booking_date,
                booking_time=booking_time,
                duration_minutes=duration_minutes,
                table=table,
            ):
                raise ValidationError('Selected table is already booked for this time.')
        else:
            available_tables = cls.get_available_tables(
                location=location,
                booking_date=booking_date,
                booking_time=booking_time,
                number_of_guests=number_of_guests,
                duration_minutes=duration_minutes,
            )
            if not available_tables:
                raise ValidationError('No tables are available for this time.')
            table = available_tables[0]

        booking = Booking.objects.create(
            customer=customer,
            restaurant=restaurant,
            location=location,
            table=table,
            booking_date=booking_date,
            booking_time=booking_time,
            number_of_guests=number_of_guests,
            duration_minutes=duration_minutes,
            special_request=special_request,
            status=status,
        )
        Customer.objects.filter(pk=customer.pk).update(total_bookings=F('total_bookings') + 1)
        return booking

    @classmethod
    @transaction.atomic
    def cancel_booking(cls, *, booking, customer, reason=''):
        if booking.customer_id != customer.pk:
            raise PermissionDenied('You can only cancel your own bookings.')
        booking.cancel(reason=reason)
        Customer.objects.filter(pk=customer.pk).update(
            cancelled_bookings=F('cancelled_bookings') + 1
        )
        return booking
