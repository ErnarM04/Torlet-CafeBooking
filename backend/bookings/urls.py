from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BookingViewSet, NotificationViewSet

router = DefaultRouter()
router.register('bookings', BookingViewSet, basename='bookings')
router.register('notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(router.urls)),
]
