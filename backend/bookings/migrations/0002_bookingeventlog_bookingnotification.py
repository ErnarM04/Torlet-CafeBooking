import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('bookings', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='BookingEventLog',
            fields=[
                ('event_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('action', models.CharField(max_length=80)),
                ('message', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('actor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='booking_events', to=settings.AUTH_USER_MODEL)),
                ('booking', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='event_logs', to='bookings.booking')),
            ],
            options={
                'db_table': 'booking_event_logs',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='BookingNotification',
            fields=[
                ('notification_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('kind', models.CharField(choices=[('booking_created', 'Booking Created'), ('booking_confirmed', 'Booking Confirmed'), ('booking_seated', 'Guests Seated'), ('booking_cancelled', 'Booking Cancelled'), ('booking_completed', 'Booking Completed'), ('booking_no_show', 'No Show'), ('booking_updated', 'Booking Updated')], max_length=40)),
                ('title', models.CharField(max_length=160)),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('booking', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='bookings.booking')),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='users.customer')),
            ],
            options={
                'db_table': 'booking_notifications',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='bookingeventlog',
            index=models.Index(fields=['booking', '-created_at'], name='booking_eve_booking_85fb16_idx'),
        ),
        migrations.AddIndex(
            model_name='bookingeventlog',
            index=models.Index(fields=['action', '-created_at'], name='booking_eve_action_ddeeb8_idx'),
        ),
        migrations.AddIndex(
            model_name='bookingnotification',
            index=models.Index(fields=['customer', 'is_read', '-created_at'], name='booking_not_custome_820424_idx'),
        ),
    ]
