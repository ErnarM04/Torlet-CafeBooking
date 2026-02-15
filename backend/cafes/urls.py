from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LocationViewSet, RestaurantViewSet, TableViewSet, TimeSlotViewSet

router = DefaultRouter()
router.register('restaurants', RestaurantViewSet, basename='restaurants')
router.register('locations', LocationViewSet, basename='locations')
router.register('tables', TableViewSet, basename='tables')
router.register('time-slots', TimeSlotViewSet, basename='time-slots')

urlpatterns = [
    path('', include(router.urls)),
]
