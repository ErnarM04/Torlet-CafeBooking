from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BookingCommentViewSet, BookingViewSet

router = DefaultRouter()
router.register('bookings', BookingViewSet, basename='bookings')
router.register('booking-comments', BookingCommentViewSet, basename='booking-comments')

urlpatterns = [
    path('', include(router.urls)),
]
