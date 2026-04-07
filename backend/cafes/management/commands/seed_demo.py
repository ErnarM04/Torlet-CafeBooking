"""
Load demo rows for development: restaurants, locations, tables, time slots, users, bookings.

Usage:
  python manage.py seed_demo

Re-running is safe: uses get_or_create / fixed demo keys where possible.
Demo login (phone / password):
  +77000000001 / demo12345  — customer Aida
  +77000000002 / demo12345  — customer Daniyar
  +77000000009 / demo12345  — staff (admin panel)
"""

from datetime import time, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from bookings.models import Booking
from cafes.models import Location, Restaurant, Table, TimeSlot
from users.models import Customer, RestaurantStaff, User


DEMO_PASSWORD = "demo12345"


def _ensure_user(phone: str, first_name: str, last_name: str, *, is_staff: bool = False):
    user, created = User.objects.get_or_create(
        phone_number=phone,
        defaults={
            "first_name": first_name,
            "last_name": last_name,
            "is_staff": is_staff,
        },
    )
    if created:
        user.set_password(DEMO_PASSWORD)
        user.save()
    return user


class Command(BaseCommand):
    help = "Insert demo restaurants, tables, slots, users, and bookings (idempotent)."

    def handle(self, *args, **options):
        today = timezone.localdate()

        # --- Users & profiles ---
        u1 = _ensure_user("+77000000001", "Aida", "Nurlanova")
        u2 = _ensure_user("+77000000002", "Daniyar", "Ospanov")
        staff = _ensure_user("+77000000009", "Admin", "Demo", is_staff=True)

        c1 = Customer.objects.get(user=u1)
        c2 = Customer.objects.get(user=u2)
        Customer.objects.filter(pk=c1.pk).update(
            total_bookings=3,
            cancelled_bookings=0,
            loyalty_points=120,
        )
        Customer.objects.filter(pk=c2.pk).update(
            total_bookings=1,
            loyalty_points=40,
        )

        staff_profile, _ = RestaurantStaff.objects.get_or_create(user=staff)

        # --- Restaurant 1 ---
        r1, _ = Restaurant.objects.get_or_create(
            name="Cafe Cozy — Абая (демо)",
            defaults={
                "description": "Уютное кафе в центре: завтраки, кофе и бронь столов онлайн.",
                "cuisine_type": "Европейская, кофе",
                "address": "пр. Абая 150, Алматы",
                "city": "Almaty",
                "latitude": Decimal("43.238949"),
                "longitude": Decimal("76.889709"),
                "images": [
                    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
                ],
                "rating": 4.7,
                "total_reviews": 42,
                "is_active": True,
            },
        )

        loc1, _ = Location.objects.get_or_create(
            restaurant=r1,
            address="пр. Абая 150, Алматы",
            defaults={
                "city": "Almaty",
                "latitude": Decimal("43.238949"),
                "longitude": Decimal("76.889709"),
                "opening_hours": "Пн–Вс 09:00–23:00",
                "is_active": True,
            },
        )

        t1, _ = Table.objects.get_or_create(
            location=loc1,
            table_number="T1",
            defaults={
                "table_type": "indoor",
                "min_guests": 2,
                "max_guests": 4,
                "description": "У окна",
                "is_available": True,
                "is_active": True,
            },
        )
        Table.objects.get_or_create(
            location=loc1,
            table_number="VIP-1",
            defaults={
                "table_type": "vip",
                "min_guests": 4,
                "max_guests": 8,
                "description": "Отдельная зона",
                "is_available": True,
                "is_active": True,
            },
        )

        weekdays = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]
        TimeSlot.objects.get_or_create(
            location=loc1,
            start_time=time(12, 0),
            end_time=time(15, 0),
            defaults={
                "duration": "3 часа",
                "days_of_week": weekdays,
                "max_bookings": 12,
                "is_active": True,
            },
        )
        TimeSlot.objects.get_or_create(
            location=loc1,
            start_time=time(18, 0),
            end_time=time(22, 0),
            defaults={
                "duration": "4 часа",
                "days_of_week": weekdays,
                "max_bookings": 15,
                "is_active": True,
            },
        )

        # --- Restaurant 2 ---
        r2, _ = Restaurant.objects.get_or_create(
            name="Bistro Nomad — Сейфуллина (демо)",
            defaults={
                "description": "Лёгкая азиатская кухня и бар. Идеально для встреч после работы.",
                "cuisine_type": "Азиатская фьюжн",
                "address": "ул. Сейфуллина 500, Алматы",
                "city": "Almaty",
                "latitude": Decimal("43.252970"),
                "longitude": Decimal("76.914454"),
                "images": [],
                "rating": 4.4,
                "total_reviews": 28,
                "is_active": True,
            },
        )

        loc2, _ = Location.objects.get_or_create(
            restaurant=r2,
            address="ул. Сейфуллина 500, Алматы",
            defaults={
                "city": "Almaty",
                "opening_hours": "Вт–Вс 11:00–00:00",
                "is_active": True,
            },
        )

        Table.objects.get_or_create(
            location=loc2,
            table_number="A1",
            defaults={
                "table_type": "terrace",
                "min_guests": 2,
                "max_guests": 4,
                "is_available": True,
                "is_active": True,
            },
        )

        TimeSlot.objects.get_or_create(
            location=loc2,
            start_time=time(19, 0),
            end_time=time(21, 30),
            defaults={
                "duration": "2.5 часа",
                "days_of_week": ["Friday", "Saturday", "Sunday"],
                "max_bookings": 8,
                "is_active": True,
            },
        )

        # Staff owns / manages only Restaurant 1 (demo)
        staff_profile.restaurants.set([r1])

        # --- Bookings (fixed numbers for idempotency) ---
        demo_bookings = [
            {
                "booking_number": "BK-DEMO-001",
                "customer": c1,
                "restaurant": r1,
                "location": loc1,
                "table": t1,
                "booking_date": today + timedelta(days=3),
                "booking_time": time(13, 0),
                "number_of_guests": 3,
                "status": "confirmed",
                "special_request": "Детский стул, если возможно.",
            },
            {
                "booking_number": "BK-DEMO-002",
                "customer": c1,
                "restaurant": r1,
                "location": loc1,
                "table": None,
                "booking_date": today + timedelta(days=10),
                "booking_time": time(19, 0),
                "number_of_guests": 2,
                "status": "pending",
                "special_request": "",
            },
            {
                "booking_number": "BK-DEMO-003",
                "customer": c2,
                "restaurant": r2,
                "location": loc2,
                "table": None,
                "booking_date": today + timedelta(days=5),
                "booking_time": time(19, 30),
                "number_of_guests": 4,
                "status": "confirmed",
                "special_request": "Без орехов.",
            },
            {
                "booking_number": "BK-DEMO-004",
                "customer": c2,
                "restaurant": r1,
                "location": loc1,
                "table": t1,
                "booking_date": today - timedelta(days=7),
                "booking_time": time(12, 30),
                "number_of_guests": 2,
                "status": "completed",
                "special_request": "",
            },
        ]

        for row in demo_bookings:
            b, created = Booking.objects.get_or_create(
                booking_number=row["booking_number"],
                defaults={
                    "customer": row["customer"],
                    "restaurant": row["restaurant"],
                    "location": row["location"],
                    "table": row["table"],
                    "booking_date": row["booking_date"],
                    "booking_time": row["booking_time"],
                    "number_of_guests": row["number_of_guests"],
                    "duration_minutes": 120,
                    "status": row["status"],
                    "special_request": row["special_request"],
                },
            )
            if not created:
                # Refresh key fields if re-run with same BK numbers
                b.customer = row["customer"]
                b.restaurant = row["restaurant"]
                b.location = row["location"]
                b.table = row["table"]
                b.booking_date = row["booking_date"]
                b.booking_time = row["booking_time"]
                b.number_of_guests = row["number_of_guests"]
                b.status = row["status"]
                b.special_request = row["special_request"]
                b.save()

        self.stdout.write(self.style.SUCCESS(
            "Demo data ready.\n"
            f"  Restaurants: {Restaurant.objects.count()}\n"
            f"  Locations: {Location.objects.count()}\n"
            f"  Tables: {Table.objects.count()}\n"
            f"  Time slots: {TimeSlot.objects.count()}\n"
            f"  Bookings (demo codes): {Booking.objects.filter(booking_number__startswith='BK-DEMO-').count()}\n"
            f"  Login: +77000000001 / {DEMO_PASSWORD} (customer), +77000000009 / {DEMO_PASSWORD} (staff)\n"
        ))
