from datetime import datetime, timedelta

from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.db.models import F

from cafes.models import Location, Restaurant, Table
from users.models import Customer

from .exceptions import BookingConflictError
from .models import Booking, BookingEventLog
from .notification_service import NotificationService


class BookingService:
    @classmethod
    def record_event(cls, *, booking, action, actor=None, message=''):
        return BookingEventLog.objects.create(
            booking=booking,
            actor=actor,
            action=action,
            message=message,
        )

    @classmethod
    def notify_customer(cls, *, booking, kind, title='', message='', reason=''):
        del title, message
        return NotificationService.notify_customer(
            booking=booking,
            kind=kind,
            reason=reason,
        )

    @classmethod
    def record_status_change(cls, *, booking, status_value, actor=None, reason=''):
        kind = (
            'booking_created'
            if status_value == 'pending'
            else f'booking_{status_value}'
        )

        cls.record_event(
            booking=booking,
            actor=actor,
            action=f'booking_{status_value}',
            message=reason or f'Booking status changed to {status_value}.',
        )

        notification = cls.notify_customer(
            booking=booking,
            kind=kind,
            reason=reason,
        )

        if status_value in ('pending', 'confirmed'):
            NotificationService.schedule_reminder(booking=booking)
        elif status_value in ('cancelled', 'completed', 'no_show'):
            NotificationService.cancel_reminder(booking=booking)

        if status_value == 'pending':
            NotificationService.notify_staff_for_booking(
                booking=booking,
                kind='staff_new_booking',
            )
        elif status_value == 'confirmed':
            NotificationService.notify_staff_for_booking(
                booking=booking,
                kind='staff_booking_confirmed',
            )

        return notification

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
    def _candidate_table_ids(cls, *, location, number_of_guests):
        return list(
            Table.objects.filter(
                location=location,
                is_active=True,
                is_available=True,
                min_guests__lte=number_of_guests,
                max_guests__gte=number_of_guests,
            )
            .order_by('max_guests', 'table_number')
            .values_list('pk', flat=True)
        )

    @classmethod
    def _lock_and_pick_table(
        cls,
        *,
        location,
        booking_date,
        booking_time,
        number_of_guests,
        duration_minutes,
        requested_table=None,
    ):
        if requested_table is not None:
            table_ids = [requested_table.pk]
        else:
            table_ids = cls._candidate_table_ids(
                location=location,
                number_of_guests=number_of_guests,
            )

        for table_pk in table_ids:
            table = Table.objects.select_for_update().get(pk=table_pk)

            if table.location_id != location.location_id:
                continue
            if not table.is_active or not table.is_available:
                if requested_table is not None:
                    raise ValidationError('Selected table is not available.')
                continue
            if not table.check_capacity(number_of_guests):
                if requested_table is not None:
                    raise ValidationError('Selected table does not fit the guest count.')
                continue
            if cls.has_conflict(
                location=location,
                booking_date=booking_date,
                booking_time=booking_time,
                duration_minutes=duration_minutes,
                table=table,
            ):
                if requested_table is not None:
                    raise BookingConflictError(
                        'Selected table is already booked for this time.',
                    )
                continue
            return table

        if requested_table is not None:
            raise BookingConflictError(
                'Selected table is already booked for this time.',
            )
        raise BookingConflictError(
            'No tables are available for this time. Another guest may have just booked.',
        )

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
    def table_statuses(
        cls,
        *,
        location,
        booking_date,
        booking_time,
        number_of_guests,
        duration_minutes=120,
    ):
        tables = Table.objects.filter(location=location).order_by("table_number")
        out = {}
        for table in tables:
            if not table.is_active or not table.is_available:
                out[str(table.table_id)] = "inactive"
                continue
            if not table.check_capacity(number_of_guests):
                out[str(table.table_id)] = "booked"
                continue
            conflict = cls.has_conflict(
                location=location,
                booking_date=booking_date,
                booking_time=booking_time,
                duration_minutes=duration_minutes,
                table=table,
            )
            out[str(table.table_id)] = "booked" if conflict else "available"
        return out

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

        table = cls._lock_and_pick_table(
            location=location,
            booking_date=booking_date,
            booking_time=booking_time,
            number_of_guests=number_of_guests,
            duration_minutes=duration_minutes,
            requested_table=table,
        )

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
        cls.record_status_change(
            booking=booking,
            status_value='pending',
            actor=customer.user,
        )
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
        cls.record_status_change(
            booking=booking,
            status_value='cancelled',
            actor=customer.user,
            reason=reason,
        )
        return booking
