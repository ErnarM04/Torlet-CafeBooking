from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Restaurant(models.Model):
    """
    Главная модель ресторана/кафе
    
    Особенности:
    - Один ресторан может иметь несколько локаций
    - Рейтинг рассчитывается автоматически из отзывов
    - Поддержка изображений (JSON array URLs)
    """
    
    restaurant_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        primary_key=True,
        verbose_name='Restaurant ID'
    )
    
    # Основная информация
    name = models.CharField(
        max_length=200,
        verbose_name='Название Ресторана'
    )
    
    description = models.TextField(
        blank=True,
        verbose_name='Описание'
    )
    
    cuisine_type = models.CharField(
        max_length=100,
        verbose_name='Тип Кухни',
        help_text='Например: Итальянская, Казахская, Азиатская'
    )
    
    # Адрес (основной, для отображения)
    address = models.TextField(verbose_name='Основной Адрес')
    city = models.CharField(max_length=100, default='Almaty')
    
    # Координаты для карты
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name='Широта'
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name='Долгота'
    )
    
    # Медиа
    images = models.JSONField(
        default=list,
        blank=True,
        verbose_name='URLs Изображений',
        help_text='Массив URL изображений'
    )
    # Пример: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
    
    # Рейтинг и отзывы
    rating = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        verbose_name='Средний Рейтинг'
    )
    total_reviews = models.IntegerField(
        default=0,
        verbose_name='Всего Отзывов'
    )
    
    # Владение (будет связано позже, когда создадите RestaurantOwner)
    # owner = models.ForeignKey(
    #     'users.RestaurantOwner',
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     related_name='owned_restaurants'
    # )
    
    # Статус
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активен'
    )
    
    # Метаданные
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Создан'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Обновлен'
    )
    
    class Meta:
        db_table = 'restaurants'
        verbose_name = 'Ресторан'
        verbose_name_plural = 'Рестораны'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['city', 'cuisine_type']),
            models.Index(fields=['-rating']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return self.name
    
    def calculate_rating(self):
        """Пересчитать средний рейтинг из отзывов"""
        from django.db.models import Avg
        # Эта функция будет доработана когда создадите Review модель
        # from apps.reviews.models import Review
        # 
        # result = Review.objects.filter(
        #     restaurant=self,
        #     is_approved=True
        # ).aggregate(Avg('rating'))
        # 
        # self.rating = result['rating__avg'] or 0.0
        # self.total_reviews = Review.objects.filter(
        #     restaurant=self,
        #     is_approved=True
        # ).count()
        # self.save(update_fields=['rating', 'total_reviews'])
        approved_reviews = self.reviews.filter(is_approved=True)
        result = approved_reviews.aggregate(Avg('rating'))
        self.rating = round(result['rating__avg'] or 0.0, 1)
        self.total_reviews = approved_reviews.count()
        self.save(update_fields=['rating', 'total_reviews'])


class Review(models.Model):
    """Customer review for a restaurant."""

    review_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        primary_key=True,
        verbose_name='Review ID'
    )
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name='Restaurant'
    )
    name = models.CharField(max_length=100, verbose_name='Customer name')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Rating'
    )
    text = models.TextField(verbose_name='Review text')
    is_approved = models.BooleanField(default=True, verbose_name='Approved')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['restaurant', 'is_approved', '-created_at']),
        ]

    def __str__(self):
        return f"{self.restaurant.name} - {self.rating}/5 by {self.name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.restaurant.calculate_rating()

    def delete(self, *args, **kwargs):
        restaurant = self.restaurant
        result = super().delete(*args, **kwargs)
        restaurant.calculate_rating()
        return result


class Location(models.Model):
    """
    Физическая локация/филиал ресторана
    
    Почему отдельная модель:
    - Один ресторан может иметь несколько филиалов
    - У каждой локации свои часы работы, столики, вместимость
    """
    
    location_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        primary_key=True,
        verbose_name='Location ID'
    )
    
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='locations',
        verbose_name='Ресторан'
    )
    
    # Адрес
    address = models.TextField(verbose_name='Полный Адрес')
    city = models.CharField(max_length=100, default='Almaty')
    
    # Координаты
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    
    # Часы работы (упрощенная версия)
    opening_hours = models.CharField(
        max_length=200,
        verbose_name='Часы Работы',
        help_text='Например: Пн-Пт 10:00-22:00, Сб-Вс 11:00-23:00'
    )
    
    # Вместимость
    total_capacity = models.IntegerField(
        default=0,
        verbose_name='Общая Вместимость',
        help_text='Рассчитывается автоматически из столиков'
    )
    
    # Статус
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активна'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'locations'
        verbose_name = 'Локация'
        verbose_name_plural = 'Локации'
        ordering = ['restaurant', 'city']
        indexes = [
            models.Index(fields=['restaurant', 'is_active']),
            models.Index(fields=['city']),
        ]
    
    def __str__(self):
        return f"{self.restaurant.name} - {self.city}"
    
    def update_capacity(self):
        """Пересчитать общую вместимость из активных столиков"""
        from django.db.models import Sum
        
        result = self.tables.filter(
            is_active=True
        ).aggregate(Sum('max_guests'))
        
        self.total_capacity = result['max_guests__sum'] or 0
        self.save(update_fields=['total_capacity'])


class Table(models.Model):
    """
    Отдельный столик в локации
    
    Ключевые концепции:
    - Типы столиков (indoor, outdoor, VIP, terrace)
    - Диапазон вместимости (min/max guests)
    - Отслеживание доступности
    - Позиция для отображения на плане зала
    """
    
    TABLE_TYPE_CHOICES = [
        ('indoor', 'Indoor'),
        ('outdoor', 'Outdoor'),
        ('vip', 'VIP'),
        ('terrace', 'Terrace'),
        ('bar', 'Bar Seating'),
        ('private', 'Private Room'),
    ]
    
    table_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        primary_key=True,
        verbose_name='Table ID'
    )
    
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        related_name='tables',
        verbose_name='Локация'
    )
    
    # Идентификация столика
    table_number = models.CharField(
        max_length=10,
        verbose_name='Номер Столика',
        help_text='Например: T1, A5, VIP-3'
    )
    
    # Тип столика
    table_type = models.CharField(
        max_length=20,
        choices=TABLE_TYPE_CHOICES,
        default='indoor',
        verbose_name='Тип Столика'
    )
    
    # Вместимость
    min_guests = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name='Минимум Гостей'
    )
    max_guests = models.IntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Максимум Гостей'
    )
    
    # Для обратной совместимости с UML
    capacity = models.IntegerField(
        editable=False,
        verbose_name='Вместимость (устаревшее поле)'
    )
    
    # Позиция на плане зала (опционально, для UI)
    position_x = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='X Позиция на Плане'
    )
    position_y = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='Y Позиция на Плане'
    )

    # Геометрия для схемы зала (UI, кинотеатр-подобный выбор)
    SHAPE_CHOICES = [
        ('rect', 'Rectangle'),
        ('round', 'Round'),
    ]
    shape = models.CharField(
        max_length=10,
        choices=SHAPE_CHOICES,
        default='rect',
        verbose_name='Форма на Плане'
    )
    width = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='Ширина на Плане'
    )
    height = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='Высота на Плане'
    )
    radius = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='Радиус (для круглых)'
    )
    rotation = models.IntegerField(
        default=0,
        verbose_name='Поворот (градусы)'
    )
    
    # Описание
    description = models.TextField(
        blank=True,
        verbose_name='Описание',
        help_text='Особенности, вид и т.д.'
    )
    
    # Статус
    is_available = models.BooleanField(
        default=True,
        verbose_name='Сейчас Доступен'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активен (не на ремонте)'
    )
    
    class Meta:
        db_table = 'tables'
        verbose_name = 'Столик'
        verbose_name_plural = 'Столики'
        unique_together = ['location', 'table_number']
        ordering = ['location', 'table_number']
        indexes = [
            models.Index(fields=['location', 'is_active', 'is_available']),
            models.Index(fields=['table_type']),
        ]
    
    def __str__(self):
        return f"{self.location.restaurant.name} - Столик {self.table_number}"
    
    def save(self, *args, **kwargs):
        # Установить capacity = max_guests для обратной совместимости
        self.capacity = self.max_guests
        super().save(*args, **kwargs)
        
        # Обновить вместимость локации
        if self.location:
            self.location.update_capacity()
    
    def check_capacity(self, number_of_guests):
        """Проверить, подходит ли столик для количества гостей"""
        return self.min_guests <= number_of_guests <= self.max_guests


class TimeSlot(models.Model):
    """
    Доступные временные слоты для бронирования в локации
    
    Примеры использования:
    - Определить окна бронирования (например, 12:00-14:00 для обеда)
    - Разные слоты для будней и выходных
    - Контроль плотности бронирований
    """
    
    time_slot_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        primary_key=True,
        verbose_name='TimeSlot ID'
    )
    
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        related_name='time_slots',
        verbose_name='Локация'
    )
    
    # Временное окно
    start_time = models.TimeField(verbose_name='Время Начала')
    end_time = models.TimeField(verbose_name='Время Окончания')
    
    # Длительность (текстовое описание)
    duration = models.CharField(
        max_length=50,
        verbose_name='Длительность',
        help_text='Например: "2 часа", "90 минут"'
    )
    
    # Дни недели когда слот активен
    days_of_week = models.JSONField(
        default=list,
        verbose_name='Активные Дни',
        help_text='Список названий дней: ["Monday", "Tuesday", ...]'
    )
    # Пример: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    
    # Максимальное количество одновременных бронирований
    max_bookings = models.IntegerField(
        default=10,
        validators=[MinValueValidator(1)],
        verbose_name='Максимум Бронирований на Слот'
    )
    
    # Статус
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активен'
    )
    
    class Meta:
        db_table = 'time_slots'
        verbose_name = 'Временной Слот'
        verbose_name_plural = 'Временные Слоты'
        ordering = ['location', 'start_time']
        indexes = [
            models.Index(fields=['location', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.location.restaurant.name} - {self.start_time} до {self.end_time}"
    
    @property
    def duration_minutes(self):
        """Рассчитать длительность в минутах"""
        from datetime import datetime, timedelta
        
        start = datetime.combine(datetime.today(), self.start_time)
        end = datetime.combine(datetime.today(), self.end_time)
        
        # Если переходит через полночь
        if end < start:
            end += timedelta(days=1)
        
        delta = end - start
        return int(delta.total_seconds() / 60)
