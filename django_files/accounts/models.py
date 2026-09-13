from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import datetime


class OTP(models.Model):
    """Stores OTP codes for registration, login, and password reset."""

    PURPOSE_CHOICES = [
        ('register', 'Registration'),
        ('login', 'Login'),
        ('reset', 'Password Reset'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=10, choices=PURPOSE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        from django.conf import settings
        expiry_minutes = getattr(settings, 'OTP_EXPIRY_MINUTES', 10)
        return timezone.now() > self.created_at + datetime.timedelta(minutes=expiry_minutes)

    def __str__(self):
        return f"{self.user.email} – {self.purpose} – {self.code}"


class UserProfile(models.Model):
    """Extended profile for role-based access."""

    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('customer', 'Customer'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')
    is_verified = models.BooleanField(default=False)   # True after OTP verified
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"
