from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


@extend_schema_view(
    list=extend_schema(tags=['Notifications'], summary='List current user notifications'),
    retrieve=extend_schema(tags=['Notifications'], summary='Get notification details'),
)
class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'notification_id'
    lookup_value_regex = '[0-9a-f-]{36}'
    queryset = Notification.objects.none()

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @extend_schema(tags=['Notifications'], summary='Mark notification as read')
    @action(detail=True, methods=['post'])
    def mark_read(self, request, notification_id=None):
        notification = self.get_object()
        notification.mark_as_read()
        return Response(NotificationSerializer(notification).data)

    @extend_schema(tags=['Notifications'], summary='Mark all notifications as read')
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'detail': 'All notifications marked as read.'})

