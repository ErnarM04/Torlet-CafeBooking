from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from cafes.models import Location, Restaurant, Table
from users.models import User

from .models import Booking


class BookingIntegrationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number='87770009911',
            password='TestPass123',
            first_name='Book',
            last_name='Tester',
            email='booking@test.com',
        )
        self.customer = self.user.customer_profile
        self.client.force_authenticate(self.user)

        self.restaurant = Restaurant.objects.create(
            name='Demo Cafe',
            description='Demo',
            cuisine_type='Fusion',
            address='Main street 1',
            city='Almaty',
        )
        self.location = Location.objects.create(
            restaurant=self.restaurant,
            address='Main street 1',
            city='Almaty',
            opening_hours='Mon-Sun 10:00-22:00',
        )
        self.table_1 = Table.objects.create(
            location=self.location,
            table_number='T1',
            table_type='indoor',
            min_guests=1,
            max_guests=2,
            is_available=True,
            is_active=True,
        )
        self.table_2 = Table.objects.create(
            location=self.location,
            table_number='T2',
            table_type='indoor',
            min_guests=1,
            max_guests=4,
            is_available=True,
            is_active=True,
        )

        dt = timezone.localtime() + timedelta(days=1, hours=1)
        self.booking_date = dt.date()
        self.booking_time = dt.time().replace(second=0, microsecond=0)

    def test_create_booking_assigns_available_table(self):
        payload = {
            'restaurant': str(self.restaurant.restaurant_id),
            'location': str(self.location.location_id),
            'booking_date': self.booking_date.isoformat(),
            'booking_time': self.booking_time.strftime('%H:%M:%S'),
            'number_of_guests': 2,
            'duration_minutes': 120,
            'special_request': 'Window seat',
        }

        response = self.client.post('/api/bookings/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created = Booking.objects.get(booking_id=response.data['booking_id'])
        self.assertEqual(created.table, self.table_1)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.total_bookings, 1)

    def test_create_booking_accepts_z_suffix_time(self):
        payload = {
            'restaurant': str(self.restaurant.restaurant_id),
            'location': str(self.location.location_id),
            'booking_date': self.booking_date.isoformat(),
            'booking_time': self.booking_time.strftime('%H:%M:%S.%f')[:-3] + 'Z',
            'number_of_guests': 2,
            'duration_minutes': 120,
        }

        response = self.client.post('/api/bookings/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_conflict_detection_for_same_table(self):
        Booking.objects.create(
            customer=self.customer,
            restaurant=self.restaurant,
            location=self.location,
            table=self.table_1,
            booking_date=self.booking_date,
            booking_time=self.booking_time,
            number_of_guests=2,
            status='confirmed',
        )

        payload = {
            'restaurant': str(self.restaurant.restaurant_id),
            'location': str(self.location.location_id),
            'table': str(self.table_1.table_id),
            'booking_date': self.booking_date.isoformat(),
            'booking_time': self.booking_time.strftime('%H:%M:%S'),
            'number_of_guests': 2,
            'duration_minutes': 120,
        }

        response = self.client.post('/api/bookings/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already booked', str(response.data).lower())

    def test_availability_includes_table_statuses(self):
        Booking.objects.create(
            customer=self.customer,
            restaurant=self.restaurant,
            location=self.location,
            table=self.table_1,
            booking_date=self.booking_date,
            booking_time=self.booking_time,
            number_of_guests=2,
            status='confirmed',
        )

        response = self.client.get(
            "/api/bookings/availability/",
            {
                "location": str(self.location.location_id),
                "booking_date": self.booking_date.isoformat(),
                "booking_time": self.booking_time.strftime("%H:%M:%S"),
                "number_of_guests": 2,
                "duration_minutes": 120,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        statuses = response.data.get("table_statuses") or {}
        self.assertEqual(statuses.get(str(self.table_1.table_id)), "booked")
        self.assertIn(statuses.get(str(self.table_2.table_id)), ("available", "booked"))

    def test_cancel_booking_updates_status_and_counters(self):
        booking = Booking.objects.create(
            customer=self.customer,
            restaurant=self.restaurant,
            location=self.location,
            table=self.table_2,
            booking_date=self.booking_date,
            booking_time=self.booking_time,
            number_of_guests=2,
            status='pending',
        )

        response = self.client.post(
            f'/api/bookings/{booking.booking_id}/cancel/',
            {'cancellation_reason': 'Plans changed'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.customer.refresh_from_db()
        self.assertEqual(booking.status, 'cancelled')
        self.assertIsNotNone(booking.cancelled_at)
        self.assertEqual(booking.cancellation_reason, 'Plans changed')
        self.assertEqual(self.customer.cancelled_bookings, 1)
