from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User
from .models import RestaurantStaff
from cafes.models import Restaurant


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


class StaffPromotionTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            phone_number='87770000001',
            password='AdminPass123',
            first_name='Admin',
            last_name='User',
            email='admin@test.com',
        )
        self.normal_user = User.objects.create_user(
            phone_number='87770000002',
            password='UserPass123',
            first_name='Normal',
            last_name='User',
            email='user@test.com',
        )
        self.restaurant = Restaurant.objects.create(
            name='Staff Test Restaurant',
            description='desc',
            cuisine_type='Fusion',
            address='Address',
            city='Almaty',
        )
        self.url = '/api/auth/staff/promote/'

    def test_admin_can_promote_user_to_staff(self):
        self.client.force_authenticate(self.admin_user)
        payload = {
            'user_id': str(self.normal_user.user_id),
            'restaurant_id': str(self.restaurant.restaurant_id),
            'position': 'manager',
            'is_active': True,
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(RestaurantStaff.objects.filter(user=self.normal_user).exists())

    def test_non_admin_cannot_promote(self):
        self.client.force_authenticate(self.normal_user)
        payload = {
            'user_id': str(self.normal_user.user_id),
            'restaurant_id': str(self.restaurant.restaurant_id),
            'position': 'manager',
            'is_active': True,
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_list_users_with_uuid(self):
        self.client.force_authenticate(self.admin_user)
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)
        self.assertIn('user_id', response.data[0])

    def test_non_admin_cannot_list_users(self):
        self.client.force_authenticate(self.normal_user)
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
