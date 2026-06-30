from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0002_bookingeventlog_bookingnotification'),
        ('users', '0005_restaurantstaff_notification_preferences'),
    ]

    operations = [
        migrations.AddField(
            model_name='bookingnotification',
            name='email_sent_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='bookingnotification',
            name='email_status',
            field=models.CharField(
                choices=[
                    ('skipped', 'Skipped'),
                    ('pending', 'Pending'),
                    ('delivered', 'Delivered'),
                    ('sent', 'Sent'),
                    ('failed', 'Failed'),
                ],
                default='skipped',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='bookingnotification',
            name='in_app_status',
            field=models.CharField(
                choices=[
                    ('skipped', 'Skipped'),
                    ('pending', 'Pending'),
                    ('delivered', 'Delivered'),
                    ('sent', 'Sent'),
                    ('failed', 'Failed'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name='bookingnotification',
            name='kind',
            field=models.CharField(
                choices=[
                    ('booking_created', 'Booking Created'),
                    ('booking_confirmed', 'Booking Confirmed'),
                    ('booking_seated', 'Guests Seated'),
                    ('booking_cancelled', 'Booking Cancelled'),
                    ('booking_completed', 'Booking Completed'),
                    ('booking_no_show', 'No Show'),
                    ('booking_updated', 'Booking Updated'),
                    ('booking_reminder', 'Booking Reminder'),
                ],
                max_length=40,
            ),
        ),
        migrations.CreateModel(
            name='StaffNotification',
            fields=[
                ('notification_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('kind', models.CharField(max_length=40)),
                ('title', models.CharField(max_length=160)),
                ('message', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('in_app_status', models.CharField(choices=[('skipped', 'Skipped'), ('delivered', 'Delivered'), ('sent', 'Sent'), ('failed', 'Failed')], default='delivered', max_length=20)),
                ('email_status', models.CharField(choices=[('skipped', 'Skipped'), ('delivered', 'Delivered'), ('sent', 'Sent'), ('failed', 'Failed')], default='skipped', max_length=20)),
                ('email_sent_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('booking', models.ForeignKey(blank=True, null=True, on_delete=models.deletion.CASCADE, related_name='staff_notifications', to='bookings.booking')),
                ('staff', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='notifications', to='users.restaurantstaff')),
            ],
            options={
                'db_table': 'staff_notifications',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='BookingReminder',
            fields=[
                ('reminder_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('remind_at', models.DateTimeField()),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('sent', 'Sent'), ('cancelled', 'Cancelled')], default='pending', max_length=20)),
                ('sent_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('booking', models.OneToOneField(on_delete=models.deletion.CASCADE, related_name='reminder', to='bookings.booking')),
            ],
            options={
                'db_table': 'booking_reminders',
                'ordering': ['remind_at'],
            },
        ),
        migrations.AddIndex(
            model_name='staffnotification',
            index=models.Index(fields=['staff', 'is_read', '-created_at'], name='staff_notif_staff_read_idx'),
        ),
        migrations.AddIndex(
            model_name='bookingreminder',
            index=models.Index(fields=['status', 'remind_at'], name='booking_rem_status_at_idx'),
        ),
    ]
