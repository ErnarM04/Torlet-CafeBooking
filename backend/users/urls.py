from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

urlpatterns = [
    path('login/', PhoneTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('sms/send/', SmsSendView.as_view(), name='sms_send'),
    path('sms/verify/', SmsVerifyView.as_view(), name='sms_verify'),
    path('register/', RegisterView.as_view(), name='register'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('test/', TestProtectedView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('notification-preferences/', NotificationPreferencesView.as_view()),
]
