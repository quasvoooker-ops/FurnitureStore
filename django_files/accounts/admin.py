from django.contrib import admin
from .models import OTP, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'is_verified', 'created_at']
    list_filter = ['role', 'is_verified']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['user', 'purpose', 'code', 'is_used', 'created_at']
    list_filter = ['purpose', 'is_used']
    search_fields = ['user__email']
    readonly_fields = ['created_at']
