import uuid
from django.core.exceptions import ValidationError
from django.db import models
from datetime import datetime, timedelta
from django.utils import timezone


class Booking(models.Model):
    ACTIVE_STATUSES = ('pending', 'confirmed', 'seated')

    booking_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        primary_key=True
    )

    booking_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )

    customer = models.ForeignKey(
        'users.Customer',
        on_delete=models.CASCADE,
        related_name='bookings'
    )

    restaurant = models.ForeignKey(
        'cafes.Restaurant',
        on_delete=models.CASCADE,
        related_name='bookings'
    )

    location = models.ForeignKey(
        'cafes.Location',
        on_delete=models.CASCADE,
        related_name='bookings'
    )

    table = models.ForeignKey(
        'cafes.Table',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings'
    )

    booking_date = models.DateField()
    booking_time = models.TimeField()
    number_of_guests = models.IntegerField()
    duration_minutes = models.IntegerField(default=120)

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('seated', 'Seated'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show')
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    special_request = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    cancellation_reason = models.TextField(blank=True)

    assigned_by = models.ForeignKey(
        'users.RestaurantStaff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_bookings'
    )

    class Meta:
        db_table = 'bookings'
        ordering = ['-booking_date', '-booking_time']
        indexes = [
            models.Index(fields=['booking_date', 'booking_time']),
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['location', 'booking_date']),
            models.Index(fields=['status']),
        ]

    def save(self, *args, **kwargs):
        if not self.booking_number:
            self.booking_number = self.generate_booking_number()
        super().save(*args, **kwargs)

    def generate_booking_number(self):
        date_str = timezone.localdate().strftime('%Y%m%d')
        random_str = ''.join([str(uuid.uuid4().int)[:5]])
        return f"BK-{date_str}-{random_str}"

    @property
    def end_time(self):
        start = datetime.combine(self.booking_date, self.booking_time)
        end = start + timedelta(minutes=self.duration_minutes)
        return end.time()

    def __str__(self):
        return f"{self.booking_number}"

    def confirm(self):
        if self.status not in ('pending',):
            raise ValidationError('Only pending bookings can be confirmed.')
        self.status = 'confirmed'
        self.confirmed_at = timezone.now()
        self.save(update_fields=['status', 'confirmed_at', 'updated_at'])

    def cancel(self, reason=''):
        if self.status in ('completed', 'cancelled', 'no_show'):
            raise ValidationError('This booking cannot be cancelled.')
        self.status = 'cancelled'
        self.cancelled_at = timezone.now()
        self.cancellation_reason = reason or ''
        self.save(
            update_fields=[
                'status',
                'cancelled_at',
                'cancellation_reason',
                'updated_at',
            ]
        )

    def complete(self):
        if self.status not in ('confirmed', 'seated'):
            raise ValidationError('Only confirmed or seated bookings can be completed.')
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'completed_at', 'updated_at'])

    def mark_no_show(self):
        if self.status not in ('pending', 'confirmed'):
            raise ValidationError('Only pending or confirmed bookings can be marked as no_show.')
        self.status = 'no_show'
        self.save(update_fields=['status', 'updated_at'])
