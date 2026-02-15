# apps/cafes/serializers.py

from rest_framework import serializers
from drf_spectacular.utils import OpenApiTypes, extend_schema_field
from .models import Restaurant, Location, Table, TimeSlot


class RestaurantListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка ресторанов (упрощенный)"""
    
    locations_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Restaurant
        fields = [
            'restaurant_id',
            'name',
            'cuisine_type',
            'city',
            'rating',
            'total_reviews',
            'images',
            'is_active',
            'locations_count',
        ]
    
    @extend_schema_field(OpenApiTypes.INT)
    def get_locations_count(self, obj):
        """Количество активных локаций"""
        return obj.locations.filter(is_active=True).count()


class RestaurantDetailSerializer(serializers.ModelSerializer):
    """Детальный сериализатор ресторана"""
    
    locations = serializers.SerializerMethodField()
    
    class Meta:
        model = Restaurant
        fields = [
            'restaurant_id',
            'name',
            'description',
            'cuisine_type',
            'address',
            'city',
            'latitude',
            'longitude',
            'images',
            'rating',
            'total_reviews',
            'is_active',
            'locations',
            'created_at',
            'updated_at',
        ]
    
    @extend_schema_field(serializers.ListField(child=serializers.DictField()))
    def get_locations(self, obj):
        """Список локаций ресторана"""
        locations = obj.locations.filter(is_active=True)
        return LocationListSerializer(locations, many=True).data


class LocationListSerializer(serializers.ModelSerializer):
    """Сериализатор списка локаций"""
    
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    tables_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Location
        fields = [
            'location_id',
            'restaurant_name',
            'address',
            'city',
            'latitude',
            'longitude',
            'opening_hours',
            'total_capacity',
            'is_active',
            'tables_count',
        ]
    
    @extend_schema_field(OpenApiTypes.INT)
    def get_tables_count(self, obj):
        """Количество активных столиков"""
        return obj.tables.filter(is_active=True).count()


class LocationDetailSerializer(serializers.ModelSerializer):
    """Детальный сериализатор локации"""
    
    restaurant = RestaurantListSerializer(read_only=True)
    tables = serializers.SerializerMethodField()
    time_slots = serializers.SerializerMethodField()
    
    class Meta:
        model = Location
        fields = [
            'location_id',
            'restaurant',
            'address',
            'city',
            'latitude',
            'longitude',
            'opening_hours',
            'total_capacity',
            'is_active',
            'tables',
            'time_slots',
            'created_at',
            'updated_at',
        ]
    
    @extend_schema_field(serializers.ListField(child=serializers.DictField()))
    def get_tables(self, obj):
        """Список столиков локации"""
        tables = obj.tables.filter(is_active=True)
        return TableSerializer(tables, many=True).data
    
    @extend_schema_field(serializers.ListField(child=serializers.DictField()))
    def get_time_slots(self, obj):
        """Доступные временные слоты"""
        slots = obj.time_slots.filter(is_active=True)
        return TimeSlotSerializer(slots, many=True).data


class TableSerializer(serializers.ModelSerializer):
    """Сериализатор столика"""
    
    location_name = serializers.CharField(
        source='location.restaurant.name',
        read_only=True
    )
    
    class Meta:
        model = Table
        fields = [
            'table_id',
            'location',
            'location_name',
            'table_number',
            'table_type',
            'min_guests',
            'max_guests',
            'capacity',
            'position_x',
            'position_y',
            'description',
            'is_available',
            'is_active',
        ]
        read_only_fields = ['capacity']


class TimeSlotSerializer(serializers.ModelSerializer):
    """Сериализатор временного слота"""
    
    duration_minutes = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = TimeSlot
        fields = [
            'time_slot_id',
            'location',
            'start_time',
            'end_time',
            'duration',
            'duration_minutes',
            'days_of_week',
            'max_bookings',
            'is_active',
        ]


# Сериализаторы для создания/обновления (Staff only)

class RestaurantCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания ресторана"""
    
    class Meta:
        model = Restaurant
        fields = [
            'name',
            'description',
            'cuisine_type',
            'address',
            'city',
            'latitude',
            'longitude',
            'images',
        ]


class LocationCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания локации"""
    
    class Meta:
        model = Location
        fields = [
            'restaurant',
            'address',
            'city',
            'latitude',
            'longitude',
            'opening_hours',
        ]


class TableCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания столика"""
    
    class Meta:
        model = Table
        fields = [
            'location',
            'table_number',
            'table_type',
            'min_guests',
            'max_guests',
            'position_x',
            'position_y',
            'description',
        ]
    
    def validate(self, data):
        """Валидация: min_guests <= max_guests"""
        if data['min_guests'] > data['max_guests']:
            raise serializers.ValidationError(
                "min_guests не может быть больше max_guests"
            )
        return data


class TimeSlotCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания временного слота"""
    
    class Meta:
        model = TimeSlot
        fields = [
            'location',
            'start_time',
            'end_time',
            'duration',
            'days_of_week',
            'max_bookings',
        ]
    
    def validate_days_of_week(self, value):
        """Валидация дней недели"""
        valid_days = [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday',
            'Friday', 'Saturday', 'Sunday'
        ]
        
        if not isinstance(value, list):
            raise serializers.ValidationError("days_of_week должен быть массивом")
        
        for day in value:
            if day not in valid_days:
                raise serializers.ValidationError(
                    f"Неверный день: {day}. Используйте: {', '.join(valid_days)}"
                )
        
        return value
