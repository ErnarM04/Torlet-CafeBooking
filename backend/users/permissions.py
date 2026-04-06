from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import RestaurantStaff


def is_staff_user(user):
    if not user or not user.is_authenticated:
        return False
    if getattr(user, "is_staff", False):
        return True
    return RestaurantStaff.objects.filter(pk=user.pk).exists()


class IsStaffUser(BasePermission):
    def has_permission(self, request, view):
        return is_staff_user(request.user)


class IsStaffOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return is_staff_user(request.user)
