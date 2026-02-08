from django.shortcuts import render

# Create your views here.
# apps/cafes/views.py

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import Restaurant, Location, Table, TimeSlot
from .serializers import (
    RestaurantListSerializer,
    RestaurantDetailSerializer,
    LocationListSerializer,
    LocationDetailSerializer,
    TableSerializer,
    TimeSlotSerializer,
)


class RestaurantViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet для просмотра ресторанов
    
    Endpoints:
    - GET /api/cafes/restaurants/ - список ресторанов
    - GET /api/cafes/restaurants/{id}/ - детали ресторана
    
    Фильтры:
    - ?city=Almaty
    - ?cuisine_type=Italian
    - ?search=pizza
    """
    
    queryset = Restaurant.objects.filter(is_active=True)
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['city', 'cuisine_type']
    search_fields = ['name', 'description', 'cuisine_type']
    ordering_fields = ['rating', 'created_at', 'name']
    ordering = ['-rating']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RestaurantDetailSerializer
        return RestaurantListSerializer
    
    @action(detail=True, methods=['get'])
    def locations(self, request, pk=None):
        """Получить локации конкретного ресторана"""
        restaurant = self.get_object()
        locations = restaurant.locations.filter(is_active=True)
        serializer = LocationListSerializer(locations, many=True)
        return Response(serializer.data)


class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet для просмотра локаций
    
    Endpoints:
    - GET /api/cafes/locations/ - список локаций
    - GET /api/cafes/locations/{id}/ - детали локации
    - GET /api/cafes/locations/{id}/tables/ - столики локации
    """
    
    queryset = Location.objects.filter(is_active=True).select_related('restaurant')
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['city', 'restaurant']
    search_fields = ['address', 'restaurant__name']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return LocationDetailSerializer
        return LocationListSerializer
    
    @action(detail=True, methods=['get'])
    def tables(self, request, pk=None):
        """Получить столики конкретной локации"""
        location = self.get_object()
        tables = location.tables.filter(is_active=True)
        
        # Опциональные фильтры
        table_type = request.query_params.get('table_type')
        min_capacity = request.query_params.get('min_capacity')
        max_capacity = request.query_params.get('max_capacity')
        
        if table_type:
            tables = tables.filter(table_type=table_type)
        
        if min_capacity:
            tables = tables.filter(max_guests__gte=int(min_capacity))
        
        if max_capacity:
            tables = tables.filter(min_guests__lte=int(max_capacity))
        
        serializer = TableSerializer(tables, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def time_slots(self, request, pk=None):
        """Получить временные слоты локации"""
        location = self.get_object()
        slots = location.time_slots.filter(is_active=True)
        serializer = TimeSlotSerializer(slots, many=True)
        return Response(serializer.data)


class TableViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet для просмотра столиков
    
    Endpoints:
    - GET /api/cafes/tables/ - список столиков
    - GET /api/cafes/tables/{id}/ - детали столика
    """
    
    queryset = Table.objects.filter(is_active=True).select_related(
        'location',
        'location__restaurant'
    )
    serializer_class = TableSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['location', 'table_type', 'is_available']
    
    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        """
        Проверить доступность столика на конкретную дату/время
        
        Query params:
        - date: YYYY-MM-DD
        - time: HH:MM
        - duration: minutes (default: 120)
        
        Пример:
        GET /api/cafes/tables/{id}/availability/?date=2024-02-10&time=18:00&duration=120
        """
        table = self.get_object()
        
        # Получить параметры
        date_str = request.query_params.get('date')
        time_str = request.query_params.get('time')
        duration = int(request.query_params.get('duration', 120))
        
        if not date_str or not time_str:
            return Response(
                {'error': 'Требуются параметры date и time'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Парсинг даты и времени
        from datetime import datetime
        try:
            booking_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            booking_time = datetime.strptime(time_str, '%H:%M').time()
        except ValueError:
            return Response(
                {'error': 'Неверный формат даты/времени'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Проверка доступности (будет реализовано в Week 3-4 Person 1)
        # Пока просто возвращаем что столик доступен
        return Response({
            'table_id': str(table.table_id),
            'table_number': table.table_number,
            'is_available': True,
            'date': date_str,
            'time': time_str,
            'duration_minutes': duration,
            'message': 'Функция проверки доступности будет реализована в следующей итерации'
        })


class TimeSlotViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet для просмотра временных слотов
    """
    
    queryset = TimeSlot.objects.filter(is_active=True).select_related('location')
    serializer_class = TimeSlotSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['location']