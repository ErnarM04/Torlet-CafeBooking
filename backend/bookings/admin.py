from django.contrib import admin

from .models import BookingEventLog, BookingNotification, BookingReminder, StaffNotification


@admin.register(BookingNotification)
class BookingNotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "customer", "booking", "kind", "is_read", "created_at")
    list_filter = ("kind", "is_read", "created_at")
    search_fields = ("title", "message", "booking__booking_number", "customer__user__phone_number")
    readonly_fields = ("notification_id", "created_at")


@admin.register(StaffNotification)
class StaffNotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "staff", "booking", "kind", "is_read", "created_at")
    list_filter = ("kind", "is_read", "created_at")
    search_fields = ("title", "message", "booking__booking_number", "staff__user__phone_number")
    readonly_fields = ("notification_id", "created_at")


@admin.register(BookingReminder)
class BookingReminderAdmin(admin.ModelAdmin):
    list_display = ("booking", "remind_at", "status", "sent_at", "created_at")
    list_filter = ("status", "remind_at")
    search_fields = ("booking__booking_number",)
    readonly_fields = ("reminder_id", "created_at")


@admin.register(BookingEventLog)
class BookingEventLogAdmin(admin.ModelAdmin):
    list_display = ("booking", "action", "actor", "created_at")
    list_filter = ("action", "created_at")
    search_fields = ("booking__booking_number", "action", "message", "actor__phone_number")
    readonly_fields = ("event_id", "created_at")
