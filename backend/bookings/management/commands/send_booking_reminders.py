from django.core.management.base import BaseCommand

from bookings.notification_service import NotificationService


class Command(BaseCommand):
    help = 'Send due booking reminders (T-24h).'

    def handle(self, *args, **options):
        sent = NotificationService.send_due_reminders()
        self.stdout.write(self.style.SUCCESS(f'Sent {sent} reminder(s).'))
