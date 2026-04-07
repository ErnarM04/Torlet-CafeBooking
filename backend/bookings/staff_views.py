from django.core.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.models import Customer, RestaurantStaff
from users.permissions import IsStaffUser

from .models import Booking
from .serializers import (
    BookingCancelSerializer,
    StaffBookingSerializer,
    StaffCustomerSerializer,
    StaffCustomerUpdateSerializer,
)


@extend_schema_view(
    list=extend_schema(tags=["Staff — Bookings"], summary="List all bookings"),
    retrieve=extend_schema(tags=["Staff — Bookings"], summary="Booking detail"),
)
class StaffBookingViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsStaffUser]
    serializer_class = StaffBookingSerializer
    lookup_field = "booking_id"
    lookup_value_regex = "[0-9a-f-]{36}"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["status", "restaurant", "location", "booking_date"]
    search_fields = [
        "booking_number",
        "customer__user__phone_number",
        "customer__user__first_name",
        "customer__user__last_name",
    ]
    ordering_fields = ["booking_date", "booking_time", "created_at", "status"]
    ordering = ["-booking_date", "-booking_time"]

    def get_queryset(self):
        return Booking.objects.select_related(
            "customer__user",
            "restaurant",
            "location",
            "table",
            "assigned_by__user",
        ).all()

    def _staff_profile(self, request):
        if not request.user.is_authenticated:
            return None
        return RestaurantStaff.objects.filter(pk=request.user.pk).first()

    @extend_schema(tags=["Staff — Bookings"], summary="Confirm pending booking")
    @action(detail=True, methods=["post"])
    def confirm(self, request, booking_id=None):
        booking = self.get_object()
        try:
            booking.confirm()
        except ValidationError as exc:
            return Response({"detail": exc.messages}, status=status.HTTP_400_BAD_REQUEST)
        booking.refresh_from_db()
        return Response(StaffBookingSerializer(booking).data)

    @extend_schema(tags=["Staff — Bookings"], summary="Mark seated (optional)")
    @action(detail=True, methods=["post"])
    def seat(self, request, booking_id=None):
        booking = self.get_object()
        if booking.status != "confirmed":
            return Response(
                {"detail": "Only confirmed bookings can be marked seated."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = "seated"
        booking.save(update_fields=["status", "updated_at"])
        return Response(StaffBookingSerializer(booking).data)

    @extend_schema(tags=["Staff — Bookings"], summary="Complete booking")
    @action(detail=True, methods=["post"])
    def complete(self, request, booking_id=None):
        booking = self.get_object()
        try:
            booking.complete()
        except ValidationError as exc:
            return Response({"detail": exc.messages}, status=status.HTTP_400_BAD_REQUEST)
        booking.refresh_from_db()
        return Response(StaffBookingSerializer(booking).data)

    @extend_schema(tags=["Staff — Bookings"], summary="Mark no-show")
    @action(detail=True, methods=["post"])
    def no_show(self, request, booking_id=None):
        booking = self.get_object()
        try:
            booking.mark_no_show()
        except ValidationError as exc:
            return Response({"detail": exc.messages}, status=status.HTTP_400_BAD_REQUEST)
        booking.refresh_from_db()
        return Response(StaffBookingSerializer(booking).data)

    @extend_schema(
        tags=["Staff — Bookings"],
        summary="Cancel booking (staff)",
        request=BookingCancelSerializer,
    )
    @action(detail=True, methods=["post"])
    def cancel(self, request, booking_id=None):
        booking = self.get_object()
        ser = BookingCancelSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        reason = ser.validated_data.get("cancellation_reason", "")
        try:
            booking.cancel(reason=reason)
        except ValidationError as exc:
            return Response({"detail": exc.messages}, status=status.HTTP_400_BAD_REQUEST)
        booking.refresh_from_db()
        return Response(StaffBookingSerializer(booking).data)

    @extend_schema(tags=["Staff — Bookings"], summary="Assign this booking to me")
    @action(detail=True, methods=["post"])
    def assign_me(self, request, booking_id=None):
        profile = self._staff_profile(request)
        if profile is None:
            return Response(
                {"detail": "No restaurant staff profile for this user."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking = self.get_object()
        booking.assigned_by = profile
        booking.save(update_fields=["assigned_by", "updated_at"])
        return Response(StaffBookingSerializer(booking).data)


@extend_schema_view(
    list=extend_schema(tags=["Staff — Customers"], summary="List customers"),
    retrieve=extend_schema(tags=["Staff — Customers"], summary="Customer detail"),
    partial_update=extend_schema(tags=["Staff — Customers"], summary="Update loyalty / preferences"),
)
class StaffCustomerViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated, IsStaffUser]
    queryset = Customer.objects.select_related("user").all()
    lookup_field = "user_id"
    http_method_names = ["get", "patch", "head", "options"]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "user__phone_number",
        "user__first_name",
        "user__last_name",
        "user__email",
    ]
    ordering_fields = ["created_at", "loyalty_points", "total_bookings"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action in ("update", "partial_update"):
            return StaffCustomerUpdateSerializer
        return StaffCustomerSerializer

    def get_queryset(self):
        """
        Staff sees only customers who have ever booked in restaurants
        assigned to their RestaurantStaff profile.

        Superusers / Django staff without RestaurantStaff profile keep full access.
        """
        base = Customer.objects.select_related("user").all()
        user = getattr(self.request, "user", None)
        if not user or not user.is_authenticated:
            return base.none()

        # Full access for Django staff that are not tied to a RestaurantStaff profile.
        if getattr(user, "is_staff", False) and not RestaurantStaff.objects.filter(pk=user.pk).exists():
            return base

        profile = RestaurantStaff.objects.filter(pk=user.pk).first()
        if not profile:
            return base.none()

        allowed = profile.restaurants.all()
        if not allowed.exists():
            return base.none()

        return base.filter(bookings__restaurant__in=allowed).distinct()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        instance.refresh_from_db()
        return Response(
            StaffCustomerSerializer(instance, context={"request": request}).data
        )
