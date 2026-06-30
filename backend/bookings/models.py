import uuid
from django.core.exceptions import ValidationError
from django.conf import settings
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


class BookingNotification(models.Model):
    class DeliveryStatus(models.TextChoices):
        SKIPPED = 'skipped', 'Skipped'
        PENDING = 'pending', 'Pending'
        DELIVERED = 'delivered', 'Delivered'
        SENT = 'sent', 'Sent'
        FAILED = 'failed', 'Failed'

    KIND_CHOICES = [
        ('booking_created', 'Booking Created'),
        ('booking_confirmed', 'Booking Confirmed'),
        ('booking_seated', 'Guests Seated'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('booking_completed', 'Booking Completed'),
        ('booking_no_show', 'No Show'),
        ('booking_updated', 'Booking Updated'),
        ('booking_reminder', 'Booking Reminder'),
    ]

    notification_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        primary_key=True,
        unique=True,
    )
    customer = models.ForeignKey(
        'users.Customer',
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    kind = models.CharField(max_length=40, choices=KIND_CHOICES)
    title = models.CharField(max_length=160)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    in_app_status = models.CharField(
        max_length=20,
        choices=DeliveryStatus.choices,
        default=DeliveryStatus.PENDING,
    )
    email_status = models.CharField(
        max_length=20,
        choices=DeliveryStatus.choices,
        default=DeliveryStatus.SKIPPED,
    )
    email_sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'booking_notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer', 'is_read', '-created_at']),
        ]

    def __str__(self):
        return f"{self.customer.user.phone_number} - {self.title}"


class StaffNotification(models.Model):
    class DeliveryStatus(models.TextChoices):
        SKIPPED = 'skipped', 'Skipped'
        DELIVERED = 'delivered', 'Delivered'
        SENT = 'sent', 'Sent'
        FAILED = 'failed', 'Failed'

    notification_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        primary_key=True,
        unique=True,
    )
    staff = models.ForeignKey(
        'users.RestaurantStaff',
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='staff_notifications',
        null=True,
        blank=True,
    )
    kind = models.CharField(max_length=40)
    title = models.CharField(max_length=160)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    in_app_status = models.CharField(
        max_length=20,
        choices=DeliveryStatus.choices,
        default=DeliveryStatus.DELIVERED,
    )
    email_status = models.CharField(
        max_length=20,
        choices=DeliveryStatus.choices,
        default=DeliveryStatus.SKIPPED,
    )
    email_sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'staff_notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['staff', 'is_read', '-created_at']),
        ]

    def __str__(self):
        return f"{self.staff.user.phone_number} - {self.title}"


class BookingReminder(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SENT = 'sent', 'Sent'
        CANCELLED = 'cancelled', 'Cancelled'

    reminder_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        primary_key=True,
        unique=True,
    )
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='reminder',
    )
    remind_at = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'booking_reminders'
        ordering = ['remind_at']
        indexes = [
            models.Index(fields=['status', 'remind_at']),
        ]

    def __str__(self):
        return f"Reminder for {self.booking.booking_number} at {self.remind_at}"


class BookingEventLog(models.Model):
    event_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        primary_key=True,
        unique=True,
    )
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='event_logs',
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='booking_events',
    )
    action = models.CharField(max_length=80)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'booking_event_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['booking', '-created_at']),
            models.Index(fields=['action', '-created_at']),
        ]

    def __str__(self):
        return f"{self.booking.booking_number} - {self.action}"
