from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User

from .models import Location, Restaurant, Table, TimeSlot


class CafeCrudApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number='87770002233',
            password='TestPass123',
            first_name='Cafe',
            last_name='Manager',
            email='cafes@test.com',
        )
        self.client.force_authenticate(self.user)

    def test_create_core_cafe_models(self):
        restaurant_payload = {
            'name': 'Swagger Test Cafe',
            'description': 'Testing from API',
            'cuisine_type': 'Italian',
            'address': 'Main 10',
            'city': 'Almaty',
            'images': [],
        }
        restaurant_res = self.client.post('/api/cafes/restaurants/', restaurant_payload, format='json')
        self.assertEqual(restaurant_res.status_code, status.HTTP_201_CREATED)
        restaurant = Restaurant.objects.get(name='Swagger Test Cafe')

        location_payload = {
            'restaurant': str(restaurant.restaurant_id),
            'address': 'Main 10',
            'city': 'Almaty',
            'opening_hours': 'Mon-Sun 10:00-22:00',
        }
        location_res = self.client.post('/api/cafes/locations/', location_payload, format='json')
        self.assertEqual(location_res.status_code, status.HTTP_201_CREATED)
        location = Location.objects.get(restaurant=restaurant, address='Main 10')

        table_payload = {
            'location': str(location.location_id),
            'table_number': 'A1',
            'table_type': 'indoor',
            'min_guests': 1,
            'max_guests': 4,
        }
        table_res = self.client.post('/api/cafes/tables/', table_payload, format='json')
        self.assertEqual(table_res.status_code, status.HTTP_201_CREATED)
        table = Table.objects.get(location=location, table_number='A1')
        self.assertEqual(table.capacity, 4)

        timeslot_payload = {
            'location': str(location.location_id),
            'start_time': '18:00:00',
            'end_time': '20:00:00',
            'duration': '2 hours',
            'days_of_week': ['Monday', 'Tuesday'],
            'max_bookings': 10,
        }
        timeslot_res = self.client.post('/api/cafes/time-slots/', timeslot_payload, format='json')
        self.assertEqual(timeslot_res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(TimeSlot.objects.filter(location=location, duration='2 hours').exists())
