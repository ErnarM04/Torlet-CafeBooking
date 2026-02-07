from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User


class AuthenticationTests(APITestCase):

    def setUp(self):
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.profile_url = '/api/auth/profile/'

        self.user_data = {
            'phone_number': '87770001122',
            'password': 'TestPass123',
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'test@test.com'
        }

    def test_user_registration(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            User.objects.filter(phone_number='87770001122').exists()
        )

    def test_jwt_login(self):
        User.objects.create_user(**self.user_data)

        response = self.client.post(self.login_url, {
            'phone_number': self.user_data['phone_number'],
            'password': self.user_data['password']
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_profile_requires_authentication(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
