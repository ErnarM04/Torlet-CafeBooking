"""Notification templates and delivery service (in-app + email; SMS excluded)."""

from __future__ import annotations

from datetime import datetime, timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from users.models import RestaurantStaff
from users.notification_prefs import (
    customer_allows_notification,
    get_customer_notification_prefs,
    get_staff_notification_prefs,
)

from .models import Booking, BookingNotification, BookingReminder, StaffNotification

REMINDER_HOURS_BEFORE = 24

NOTIFICATION_TEMPLATES = {
    "en": {
        "booking_created": (
            "Booking received",
            "Your booking {booking_number} at {restaurant} on {date} at {time} "
            "for {guests} guests is waiting for confirmation.",
        ),
        "booking_confirmed": (
            "Booking confirmed",
            "Your booking {booking_number} at {restaurant} on {date} at {time} is confirmed.",
        ),
        "booking_seated": (
            "Guests seated",
            "Your party for booking {booking_number} at {restaurant} has been seated.",
        ),
        "booking_completed": (
            "Booking completed",
            "Thank you for visiting {restaurant}. Booking {booking_number} is marked completed.",
        ),
        "booking_cancelled": (
            "Booking cancelled",
            "Booking {booking_number} at {restaurant} on {date} at {time} was cancelled.",
        ),
        "booking_no_show": (
            "Marked as no-show",
            "Booking {booking_number} at {restaurant} was marked as no-show.",
        ),
        "booking_reminder": (
            "Booking reminder",
            "Reminder: you have a booking {booking_number} at {restaurant} tomorrow at {time}.",
        ),
        "staff_new_booking": (
            "New booking",
            "New booking {booking_number} at {restaurant} on {date} at {time} for {guests} guests.",
        ),
        "staff_booking_confirmed": (
            "Booking confirmed",
            "Booking {booking_number} at {restaurant} was confirmed.",
        ),
        "booking_updated": (
            "Booking updated",
            "Your booking {booking_number} at {restaurant} was updated.",
        ),
    },
    "ru": {
        "booking_created": (
            "Бронь получена",
            "Ваша бронь {booking_number} в {restaurant} на {date} в {time} "
            "на {guests} гостей ожидает подтверждения.",
        ),
        "booking_confirmed": (
            "Бронь подтверждена",
            "Ваша бронь {booking_number} в {restaurant} на {date} в {time} подтверждена.",
        ),
        "booking_seated": (
            "Гости размещены",
            "Ваши гости по брони {booking_number} в {restaurant} размещены.",
        ),
        "booking_completed": (
            "Визит завершён",
            "Спасибо за визит в {restaurant}. Бронь {booking_number} завершена.",
        ),
        "booking_cancelled": (
            "Бронь отменена",
            "Бронь {booking_number} в {restaurant} на {date} в {time} отменена.",
        ),
        "booking_no_show": (
            "Неявка",
            "Бронь {booking_number} в {restaurant} отмечена как неявка.",
        ),
        "booking_reminder": (
            "Напоминание о брони",
            "Напоминание: у вас бронь {booking_number} в {restaurant} завтра в {time}.",
        ),
        "staff_new_booking": (
            "Новая бронь",
            "Новая бронь {booking_number} в {restaurant} на {date} в {time} для {guests} гостей.",
        ),
        "staff_booking_confirmed": (
            "Бронь подтверждена",
            "Бронь {booking_number} в {restaurant} подтверждена.",
        ),
        "booking_updated": (
            "Бронь обновлена",
            "Ваша бронь {booking_number} в {restaurant} была обновлена.",
        ),
    },
}


def get_customer_locale(customer) -> str:
    prefs = customer.preferences or {}
    locale = prefs.get("locale") or prefs.get("language") or "en"
    return locale if locale in NOTIFICATION_TEMPLATES else "en"


def render_template(*, kind: str, locale: str, booking: Booking, reason: str = "") -> tuple[str, str]:
    templates = NOTIFICATION_TEMPLATES.get(locale, NOTIFICATION_TEMPLATES["en"])
    title_tpl, message_tpl = templates.get(
        kind,
        templates["booking_updated"],
    )
    context = {
        "booking_number": booking.booking_number,
        "restaurant": booking.restaurant.name,
        "location": booking.location.address,
        "date": booking.booking_date.strftime("%Y-%m-%d"),
        "time": booking.booking_time.strftime("%H:%M"),
        "guests": booking.number_of_guests,
    }
    title = title_tpl.format(**context)
    message = message_tpl.format(**context)
    if reason:
        message = f"{message} Reason: {reason}"
    return title, message


def staff_allows_notification(*, staff: RestaurantStaff, kind: str) -> dict[str, bool]:
    prefs = get_staff_notification_prefs(staff)
    if not prefs["notifications_enabled"]:
        return {"in_app": False, "email": False}
    if kind == "staff_new_booking" and not prefs["new_booking_alerts"]:
        return {"in_app": False, "email": False}
    if kind == "staff_booking_confirmed" and not prefs["booking_confirmations"]:
        return {"in_app": False, "email": False}
    return {
        "in_app": prefs["in_app_enabled"],
        "email": prefs["email_enabled"],
    }


class NotificationService:
    @classmethod
    def notify_customer(cls, *, booking: Booking, kind: str, reason: str = ""):
        channels = customer_allows_notification(customer=booking.customer, kind=kind)
        if not any(channels.values()):
            return None

        locale = get_customer_locale(booking.customer)
        title, message = render_template(
            kind=kind,
            locale=locale,
            booking=booking,
            reason=reason,
        )

        notification = None
        email_status = BookingNotification.DeliveryStatus.SKIPPED
        in_app_status = BookingNotification.DeliveryStatus.SKIPPED
        email_sent_at = None

        if channels["in_app"]:
            notification = BookingNotification.objects.create(
                customer=booking.customer,
                booking=booking,
                kind=kind,
                title=title,
                message=message,
                in_app_status=BookingNotification.DeliveryStatus.DELIVERED,
            )
            in_app_status = BookingNotification.DeliveryStatus.DELIVERED

        user_email = booking.customer.user.email
        if channels["email"] and user_email:
            try:
                sent = send_mail(
                    subject=title,
                    message=message,
                    from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
                    recipient_list=[user_email],
                    fail_silently=False,
                )
                email_status = (
                    BookingNotification.DeliveryStatus.SENT
                    if sent
                    else BookingNotification.DeliveryStatus.FAILED
                )
                if sent:
                    email_sent_at = timezone.now()
            except Exception:
                email_status = BookingNotification.DeliveryStatus.FAILED

        if notification is not None:
            notification.email_status = email_status
            notification.in_app_status = in_app_status
            notification.email_sent_at = email_sent_at
            notification.save(
                update_fields=["email_status", "in_app_status", "email_sent_at"],
            )

        return notification

    @classmethod
    def notify_staff_for_booking(cls, *, booking: Booking, kind: str):
        staff_members = RestaurantStaff.objects.filter(
            restaurants=booking.restaurant,
        ).select_related("user")

        locale = "en"
        title, message = render_template(kind=kind, locale=locale, booking=booking)

        for staff in staff_members:
            channels = staff_allows_notification(staff=staff, kind=kind)
            if not any(channels.values()):
                continue

            notification = None
            email_status = StaffNotification.DeliveryStatus.SKIPPED
            email_sent_at = None

            if channels["in_app"]:
                notification = StaffNotification.objects.create(
                    staff=staff,
                    booking=booking,
                    kind=kind,
                    title=title,
                    message=message,
                    in_app_status=StaffNotification.DeliveryStatus.DELIVERED,
                )

            user_email = staff.user.email
            if channels["email"] and user_email:
                try:
                    sent = send_mail(
                        subject=title,
                        message=message,
                        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
                        recipient_list=[user_email],
                        fail_silently=False,
                    )
                    email_status = (
                        StaffNotification.DeliveryStatus.SENT
                        if sent
                        else StaffNotification.DeliveryStatus.FAILED
                    )
                    if sent:
                        email_sent_at = timezone.now()
                except Exception:
                    email_status = StaffNotification.DeliveryStatus.FAILED

            if notification is not None:
                notification.email_status = email_status
                notification.email_sent_at = email_sent_at
                notification.save(update_fields=["email_status", "email_sent_at"])

    @classmethod
    def schedule_reminder(cls, *, booking: Booking):
        prefs = get_customer_notification_prefs(booking.customer)
        if not prefs["reminders_enabled"] or not prefs["notifications_enabled"]:
            return None

        if booking.status not in Booking.ACTIVE_STATUSES:
            return None

        booking_start = timezone.make_aware(
            datetime.combine(booking.booking_date, booking.booking_time),
            timezone.get_current_timezone(),
        )
        remind_at = booking_start - timedelta(hours=REMINDER_HOURS_BEFORE)
        if remind_at <= timezone.now():
            return None

        reminder, _ = BookingReminder.objects.get_or_create(
            booking=booking,
            defaults={"remind_at": remind_at},
        )
        return reminder

    @classmethod
    def cancel_reminder(cls, *, booking: Booking):
        BookingReminder.objects.filter(
            booking=booking,
            status=BookingReminder.Status.PENDING,
        ).update(status=BookingReminder.Status.CANCELLED)

    @classmethod
    @transaction.atomic
    def send_due_reminders(cls):
        due = BookingReminder.objects.select_related(
            "booking__customer__user",
            "booking__restaurant",
            "booking__location",
        ).filter(
            status=BookingReminder.Status.PENDING,
            remind_at__lte=timezone.now(),
        )

        sent_count = 0
        for reminder in due:
            booking = reminder.booking
            if booking.status not in Booking.ACTIVE_STATUSES:
                reminder.status = BookingReminder.Status.CANCELLED
                reminder.save(update_fields=["status"])
                continue

            cls.notify_customer(booking=booking, kind="booking_reminder")
            reminder.status = BookingReminder.Status.SENT
            reminder.sent_at = timezone.now()
            reminder.save(update_fields=["status", "sent_at"])
            sent_count += 1

        return sent_count
