from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("name", "restaurant", "rating", "is_approved", "created_at")
    list_filter = ("rating", "is_approved", "created_at")
    search_fields = ("name", "text", "restaurant__name")
    readonly_fields = ("review_id", "created_at")
