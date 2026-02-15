from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import uuid


class UserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('Phone number is required')

        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')

        return self.create_user(phone_number, password, **extra_fields)


class User(AbstractUser):
    username = None  # removed completely

    user_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    phone_number = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True)

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    objects = UserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return self.phone_number

class Customer(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='customer_profile',
        primary_key=True
    )

    customer_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True
    )

    total_bookings = models.IntegerField(default=0)
    cancelled_bookings = models.IntegerField(default=0)
    no_show_count = models.IntegerField(default=0)

    loyalty_points = models.IntegerField(default=0)

    preferences = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Customer {self.user.phone_number}"

    @property
    def reliability_score(self):
        if self.total_bookings == 0:
            return 100
        completed = (
            self.total_bookings
            - self.cancelled_bookings
            - self.no_show_count
        )
        return round((completed / self.total_bookings) * 100, 2)

class RestaurantStaff(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='staff_profile',
        primary_key=True
    )

    staff_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Staff {self.user.phone_number}"
