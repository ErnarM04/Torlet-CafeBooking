from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User

from .models import Notification


class NotificationApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number='87770004455',
            password='TestPass123',
            first_name='Notif',
            last_name='User',
            email='notif@test.com',
        )
        self.client.force_authenticate(self.user)
        self.notification = Notification.objects.create(
            user=self.user,
            type='system',
            title='Welcome',
            message='Hello from test.',
        )

    def test_list_user_notifications(self):
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_mark_notification_as_read(self):
        response = self.client.post(f'/api/notifications/{self.notification.notification_id}/mark_read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_read)

