from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .staff_views import (
    StaffAssistantChatView,
    StaffBookingViewSet,
    StaffCustomerViewSet,
)

router = DefaultRouter()
router.register("bookings", StaffBookingViewSet, basename="staff-bookings")
router.register("customers", StaffCustomerViewSet, basename="staff-customers")

urlpatterns = [
    path("assistant/chat/", StaffAssistantChatView.as_view(), name="staff-assistant-chat"),
    path("", include(router.urls)),
]
