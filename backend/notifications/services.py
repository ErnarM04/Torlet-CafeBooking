from .models import Notification


class NotificationService:
    @staticmethod
    def notify_user(*, user, notif_type, title, message):
        return Notification.objects.create(
            user=user,
            type=notif_type,
            title=title,
            message=message,
        )

